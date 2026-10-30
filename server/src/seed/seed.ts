
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../models/Complaint.js';
import { ComplaintHistory } from '../models/ComplaintHistory.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { calculatePriorityScore } from '../ai/priorityEngine.js';
import { detectDuplicates } from '../ai/duplicateDetector.js';

dotenv.config();

export async function seedDatabaseData() {
  console.log('[Seed] Starting database seeding for CivicPulse AI demonstration...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Complaint.deleteMany({}),
    ComplaintHistory.deleteMany({}),
    AIAnalysis.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  console.log('[Seed] Cleaned existing collections.');

  // 1. Create Core Departments
  const deptData = [
    { name: 'Road Maintenance Department', code: 'RMD', description: 'Repairs potholes, asphalt resurfacing, curb and lane safety.' },
    { name: 'Drainage and Sanitation Department', code: 'DSD', description: 'Stormwater channels, underground sewage, culverts and desilting.' },
    { name: 'Waste Management Department', code: 'WMD', description: 'Solid waste collection, litter cleanup, and garbage bin clearance.' },
    { name: 'Electrical Maintenance Department', code: 'EMD', description: 'Streetlights, junction illumination, and public cable safety.' },
    { name: 'Public Infrastructure Department', code: 'PID', description: 'Bridges, pedestrian footpaths, railings, and public bus shelters.' },
    { name: 'Public Safety & Vigilance', code: 'PSV', description: 'Physical municipal safety, open hazard abatement, and community protection.' },
  ];

  const createdDepts: { [code: string]: any } = {};
  for (const d of deptData) {
    const dept = await Department.create(d);
    createdDepts[d.code] = dept;
  }
  console.log(`[Seed] Created ${Object.keys(createdDepts).length} departments.`);

  // 2. Create Demonstration Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@12345', salt);
  const officerPassword = await bcrypt.hash('Officer@12345', salt);
  const citizenPassword = await bcrypt.hash('Citizen@12345', salt);

  const admin = await User.create({
    name: 'Municipal Commissioner Sarah Chen',
    email: 'admin@civicpulse.gov',
    passwordHash: adminPassword,
    role: 'admin',
    phone: '+1-555-0199',
  });

  const officerDrainage = await User.create({
    name: 'Senior Officer Rajesh Kumar',
    email: 'drainage.officer@civicpulse.gov',
    passwordHash: officerPassword,
    role: 'officer',
    departmentId: createdDepts['DSD']._id,
    phone: '+1-555-0142',
  });

  const officerRoads = await User.create({
    name: 'Chief Inspector David Miller',
    email: 'roads.officer@civicpulse.gov',
    passwordHash: officerPassword,
    role: 'officer',
    departmentId: createdDepts['RMD']._id,
    phone: '+1-555-0188',
  });

  // Attach officers to departments
  createdDepts['DSD'].officerIds.push(officerDrainage._id);
  await createdDepts['DSD'].save();
  createdDepts['RMD'].officerIds.push(officerRoads._id);
  await createdDepts['RMD'].save();

  const citizen1 = await User.create({
    name: 'John Doe',
    email: 'citizen@example.com',
    passwordHash: citizenPassword,
    role: 'citizen',
    phone: '+1-555-0101',
  });

  const citizen2 = await User.create({
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    passwordHash: citizenPassword,
    role: 'citizen',
    phone: '+1-555-0102',
  });

  console.log('[Seed] Created demonstration accounts.');

  interface SeedComplaintTemplate {
    title: string;
    description: string;
    category: string;
    address: string;
    lat: number;
    lng: number;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    safetyRisk: boolean;
    deptCode?: string;
    officer?: any;
    status: ComplaintStatus;
    daysAgo: number;
  }

  const rawSeedTemplates: SeedComplaintTemplate[] = [
    // CLUSTER 1: Waterlogging and Drainage around Central Market & MG Road (Demonstrates duplicates & Hotspot)
    {
      title: 'Severe waterlogging blocking traffic on MG Road near Metro Pillar 140',
      description: 'Water has accumulated 1.5 feet deep across the entire 4-lane carriage way after rain. Vehicles are stalled and two-wheelers are skidding. Drainage culvert is completely choked with debris.',
      category: 'Waterlogging',
      address: 'MG Road Metro Pillar 140, Central Ward',
      lat: 12.9742,
      lng: 77.6082,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'DSD',
      officer: officerDrainage,
      status: 'IN_PROGRESS',
      daysAgo: 1,
    },
    {
      title: 'Water logging and flooded lane near Metro Pillar 142 on MG Road',
      description: 'Dirty stormwater is standing near the metro pillar 142. Cars are unable to pass without splashing dirty water into adjacent shops.',
      category: 'Waterlogging',
      address: 'MG Road Pillar 142, Central Ward',
      lat: 12.9744,
      lng: 77.6085,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'DSD',
      status: 'ASSIGNED',
      daysAgo: 1,
    },
    {
      title: 'Drainage overflow and backflow near Metro Gate 2 MG Road',
      description: 'The underground stormwater drain is backing up and dirty water is gushing onto the sidewalk near the metro entrance. Foul odor and pedestrian barrier.',
      category: 'Drainage and sewage',
      address: 'Near Metro Gate 2, MG Road, Central Ward',
      lat: 12.9745,
      lng: 77.6081,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'DSD',
      status: 'UNDER_REVIEW',
      daysAgo: 2,
    },
    {
      title: 'Choked storm drain grating on 3rd Cross MG Road',
      description: 'Plastic bags and tree branches are blocking the iron drain grate. Water cannot enter the drain.',
      category: 'Drainage and sewage',
      address: '3rd Cross, Off MG Road, Central Ward',
      lat: 12.9739,
      lng: 77.6078,
      urgency: 'Medium',
      safetyRisk: false,
      deptCode: 'DSD',
      status: 'SUBMITTED',
      daysAgo: 0,
    },
    {
      title: 'Deep pothole submerged under water near MG Road traffic junction',
      description: 'A dangerous 8-inch deep crater hidden beneath stagnant water has caused multiple scooter accidents this morning.',
      category: 'Roads and potholes',
      address: 'MG Road and Brigade Junction, Central Ward',
      lat: 12.9741,
      lng: 77.6089,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'RMD',
      officer: officerRoads,
      status: 'IN_PROGRESS',
      daysAgo: 2,
    },

    // CLUSTER 2: Road Damage & Infrastructure around Tech Park Corridor (Cluster & Hotspot)
    {
      title: 'Multiple deep potholes along outer lane of Tech Park Boulevard',
      description: 'Large series of potholes spanning 100 meters on the boulevard causing heavy bottleneck and rim damage to vehicles during morning commute.',
      category: 'Roads and potholes',
      address: 'Tech Park Boulevard, Gate 3, Sector 4',
      lat: 12.9862,
      lng: 77.6152,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'RMD',
      officer: officerRoads,
      status: 'ASSIGNED',
      daysAgo: 3,
    },
    {
      title: 'Asphalt surface peeling and huge crater on Tech Park Road Gate 3',
      description: 'Road has completely broken down near Gate 3. Busses are having to swerve into oncoming traffic lane to avoid the crater.',
      category: 'Roads and potholes',
      address: 'Tech Park Boulevard near Gate 3, Sector 4',
      lat: 12.9861,
      lng: 77.6154,
      urgency: 'High',
      safetyRisk: true,
      status: 'SUBMITTED',
      daysAgo: 1,
    },
    {
      title: 'Damaged guard rail and broken sidewalk opposite Tech Park Gate 4',
      description: 'Metal pedestrian safety railing was knocked down by a truck and is dangling into the road lane.',
      category: 'Public infrastructure',
      address: 'Tech Park Boulevard Opp Gate 4, Sector 4',
      lat: 12.9868,
      lng: 77.6158,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'PID',
      status: 'SUBMITTED',
      daysAgo: 2,
    },
    {
      title: 'Streetlights out for entire 500m stretch of Tech Park Outer Ring',
      description: 'Complete blackout along the service road for 4 consecutive nights. Very unsafe for evening pedestrians and women leaving office.',
      category: 'Streetlights',
      address: 'Tech Park Outer Ring Service Road, Sector 4',
      lat: 12.9855,
      lng: 77.6148,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'EMD',
      status: 'IN_PROGRESS',
      daysAgo: 4,
    },
    {
      title: 'Broken streetlight pole tilting precariously over roadway',
      description: 'An old lamppost has rusted at the base and is leaning over the cycling path at a 45 degree angle. Risk of collapse.',
      category: 'Streetlights',
      address: 'Tech Park Avenue 2, Sector 4',
      lat: 12.9870,
      lng: 77.6160,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'EMD',
      status: 'ASSIGNED',
      daysAgo: 1,
    },

    // CLUSTER 3: Waste Management & Sanitation around Residential Colony / School Zone
    {
      title: 'Overflowing municipal garbage dumpster attracting stray packs near St. Paul High School',
      description: 'The green community bin has not been cleared for 6 days. Trash has spilled over 20 feet onto the school entrance walkway. Stray dogs are aggressive.',
      category: 'Waste management',
      address: 'Opposite St. Paul School, Nehru Colony, Ward 12',
      lat: 12.9612,
      lng: 77.5992,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'WMD',
      status: 'IN_PROGRESS',
      daysAgo: 3,
    },
    {
      title: 'Huge heap of uncollected garbage outside St. Paul School gate',
      description: 'Trash is piled up high by the school boundary wall. Rotten smell and flies entering classrooms.',
      category: 'Waste management',
      address: 'Nehru Colony 1st Main, School Gate, Ward 12',
      lat: 12.9614,
      lng: 77.5995,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'WMD',
      status: 'SUBMITTED',
      daysAgo: 1,
    },
    {
      title: 'Illegal dumping of commercial construction debris on school perimeter',
      description: 'Concrete blocks and rubble dumped overnight blocking sidewalk and water runoff ditch.',
      category: 'Waste management',
      address: 'Nehru Colony Back Road, Ward 12',
      lat: 12.9608,
      lng: 77.5989,
      urgency: 'Medium',
      safetyRisk: false,
      deptCode: 'WMD',
      status: 'UNDER_REVIEW',
      daysAgo: 4,
    },
    {
      title: 'Open sewage manhole cover missing in front of Nehru Park',
      description: 'The circular iron manhole lid was stolen or displaced. A 10-foot vertical drop is left completely open with no warning signage.',
      category: 'Public safety',
      address: 'Nehru Park Main Entrance, Ward 12',
      lat: 12.9618,
      lng: 77.5998,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'PSV',
      status: 'ASSIGNED',
      daysAgo: 1,
    },
    {
      title: 'Broken pedestrian park bench with exposed rusted nails',
      description: 'Wooden slats shattered, rusty iron nails exposed where senior citizens sit.',
      category: 'Public infrastructure',
      address: 'Nehru Park Walking Track, Ward 12',
      lat: 12.9622,
      lng: 77.6002,
      urgency: 'Low',
      safetyRisk: false,
      deptCode: 'PID',
      status: 'SUBMITTED',
      daysAgo: 6,
    },

    // RESOLVED COMPLAINTS (Demonstrating resolution history, before-after, and resolution remarks)
    {
      title: 'Large sinkhole forming near Railway Station Overpass',
      description: 'Asphalt collapse near the bridge abutment. Pavement gave way after heavy shower.',
      category: 'Roads and potholes',
      address: 'Station Road Overpass Approach, Ward 5',
      lat: 12.9780,
      lng: 77.5850,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'RMD',
      officer: officerRoads,
      status: 'RESOLVED',
      daysAgo: 8,
    },
    {
      title: 'Raw sewage overflow at Gandhi Nagar Market cross',
      description: 'Drain blocked with plastic bags causing dirty wastewater to pool in front of vegetable stalls.',
      category: 'Drainage and sewage',
      address: 'Gandhi Nagar Vegetable Market, Ward 8',
      lat: 12.9710,
      lng: 77.5800,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'DSD',
      officer: officerDrainage,
      status: 'RESOLVED',
      daysAgo: 10,
    },
    {
      title: 'Fallen tree branch blocking one lane of Hospital Road',
      description: 'Large bough cracked and fell onto road during thunderstorm, obstructing ambulance path.',
      category: 'Public safety',
      address: 'City Hospital Approach Road, Ward 3',
      lat: 12.9650,
      lng: 77.5910,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'PSV',
      status: 'RESOLVED',
      daysAgo: 7,
    },
    {
      title: 'Burned out streetlight junction at 5th Main Indiranagar',
      description: 'All 4 luminaires on the high-mast pole at the roundabout failed.',
      category: 'Streetlights',
      address: '5th Main Roundabout, Indiranagar',
      lat: 12.9770,
      lng: 77.6400,
      urgency: 'Medium',
      safetyRisk: false,
      deptCode: 'EMD',
      status: 'RESOLVED',
      daysAgo: 12,
    },
    {
      title: 'Overflowing dustbins along Lake Promenade',
      description: 'Weekend litter overflowing onto grass and water edge.',
      category: 'Waste management',
      address: 'Ulsoor Lake Promenade, North Side',
      lat: 12.9820,
      lng: 77.6200,
      urgency: 'Medium',
      safetyRisk: false,
      deptCode: 'WMD',
      status: 'RESOLVED',
      daysAgo: 9,
    },

    // ADDITIONAL 21+ REALISTIC SPREAD-OUT INCIDENTS ACROSS THE METROPOLIS
    {
      title: 'Caved-in storm culvert on Airport Link Road',
      description: 'Heavy truck caused concrete slab to rupture. One lane cordoned off with stones.',
      category: 'Roads and potholes',
      address: 'Airport Link Expressway Km 4.2',
      lat: 12.9940,
      lng: 77.6020,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'RMD',
      status: 'ASSIGNED',
      daysAgo: 2,
    },
    {
      title: 'Cracked road divider blocks protruding into fast lane',
      description: 'Concrete median knocked out of alignment, posing high collision hazard at night.',
      category: 'Roads and potholes',
      address: 'Ring Road Flyover Entry',
      lat: 12.9520,
      lng: 77.6180,
      urgency: 'High',
      safetyRisk: true,
      status: 'SUBMITTED',
      daysAgo: 1,
    },
    {
      title: 'Loose stone gravel scattered across busy motorcycle turn',
      description: 'Uncovered gravel truck spilled aggregates on the sharp turn. Two bikes slipped today.',
      category: 'Roads and potholes',
      address: 'Commercial Street Junction',
      lat: 12.9810,
      lng: 77.6100,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'RMD',
      status: 'IN_PROGRESS',
      daysAgo: 3,
    },
    {
      title: 'Water pipe burst flooding residential lane with clean potable water',
      description: 'Municipal water main fractured under high pressure. Thousands of liters wasting down the gutter.',
      category: 'Waterlogging',
      address: '14th Cross, Malleshwaram 4th Block',
      lat: 12.9980,
      lng: 77.5710,
      urgency: 'High',
      safetyRisk: false,
      deptCode: 'DSD',
      status: 'UNDER_REVIEW',
      daysAgo: 1,
    },
    {
      title: 'Persistent dirty water stagnation in front of primary health center',
      description: 'Water has been standing for 2 weeks. Mosquitoes breeding extensively next to the clinic.',
      category: 'Waterlogging',
      address: 'Health Center Road, Ward 15',
      lat: 12.9540,
      lng: 77.5850,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'DSD',
      status: 'ASSIGNED',
      daysAgo: 5,
    },
    {
      title: 'Underpass flooded with 3 feet water after storm',
      description: 'Pumping motor at the railway underpass failed. Cars completely unable to cross.',
      category: 'Waterlogging',
      address: 'Majestic Railway Underpass',
      lat: 12.9760,
      lng: 77.5720,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'DSD',
      officer: officerDrainage,
      status: 'IN_PROGRESS',
      daysAgo: 1,
    },
    {
      title: 'Open stormwater drain wall collapsed into adjacent garden',
      description: 'Brick retaining wall of the storm canal gave way during rain.',
      category: 'Drainage and sewage',
      address: 'Shanti Nagar Canal Road',
      lat: 12.9580,
      lng: 77.5950,
      urgency: 'Medium',
      safetyRisk: true,
      deptCode: 'DSD',
      status: 'SUBMITTED',
      daysAgo: 4,
    },
    {
      title: 'Commercial kitchen dumping oil and grease directly into open drain',
      description: 'Restaurant waste hardening in gutter causing severe sanitary blockage.',
      category: 'Drainage and sewage',
      address: '80ft Road, Koramangala 4th Block',
      lat: 12.9340,
      lng: 77.6250,
      urgency: 'Medium',
      safetyRisk: false,
      deptCode: 'DSD',
      status: 'UNDER_REVIEW',
      daysAgo: 3,
    },
    {
      title: 'Sewage backup seeping into apartment basement car park',
      description: 'Main municipal collection line choked, pushing wastewater backward through basement drains.',
      category: 'Drainage and sewage',
      address: 'Green Meadows Apartment, Jayanagar 7th Block',
      lat: 12.9280,
      lng: 77.5820,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'DSD',
      officer: officerDrainage,
      status: 'IN_PROGRESS',
      daysAgo: 2,
    },
    {
      title: 'Illegal plastic burning in open plot creating toxic smoke',
      description: 'Unidentified individuals burning mountains of waste at dusk. Air unbreathable for elderly.',
      category: 'Waste management',
      address: 'Vacant Plot 45, BTM 2nd Stage',
      lat: 12.9150,
      lng: 77.6100,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'WMD',
      status: 'ASSIGNED',
      daysAgo: 2,
    },
    {
      title: 'Dead animal carcass unattended on sidewalk for two days',
      description: 'Decomposing carcass creating severe health hazard on busy pedestrian street.',
      category: 'Waste management',
      address: 'Bannerghatta Main Road near Diary Circle',
      lat: 12.9380,
      lng: 77.6010,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'WMD',
      status: 'ASSIGNED',
      daysAgo: 1,
    },
    {
      title: 'Vegetable market organic refuse rotting in piles',
      description: 'Rotten vegetables dumped along the service road attracting swarms of flies.',
      category: 'Waste management',
      address: 'KR Market Wholesale Yard',
      lat: 12.9640,
      lng: 77.5750,
      urgency: 'Medium',
      safetyRisk: false,
      deptCode: 'WMD',
      status: 'SUBMITTED',
      daysAgo: 2,
    },
    {
      title: 'Streetlights flickering erratically and buzzing loudly',
      description: 'Electrical transformer on the pole making loud arcing sounds, lights strobe continuously.',
      category: 'Streetlights',
      address: '100ft Road, Indiranagar',
      lat: 12.9720,
      lng: 77.6430,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'EMD',
      status: 'SUBMITTED',
      daysAgo: 3,
    },
    {
      title: 'Dark pedestrian subway due to vandalized lighting fixtures',
      description: 'Underground pedestrian walkway pitch dark after sundown; pedestrians avoiding it.',
      category: 'Streetlights',
      address: 'City Railway Station Pedestrian Subway',
      lat: 12.9775,
      lng: 77.5700,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'EMD',
      status: 'IN_PROGRESS',
      daysAgo: 5,
    },
    {
      title: 'Exposed live electrical wires hanging from street junction box',
      description: 'Junction box cover torn off, bare wire loops within reach of children.',
      category: 'Streetlights',
      address: 'Richmond Road, Opp Baldwin Girls School',
      lat: 12.9660,
      lng: 77.6030,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'EMD',
      status: 'ASSIGNED',
      daysAgo: 1,
    },
    {
      title: 'Shattered glass panes at bus shelter hanging loosely',
      description: 'Vandalized glass bus stop shelter with large shards threatening to fall on commuters.',
      category: 'Public infrastructure',
      address: 'Corporation Circle Bus Stand',
      lat: 12.9680,
      lng: 77.5890,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'PID',
      status: 'UNDER_REVIEW',
      daysAgo: 3,
    },
    {
      title: 'Collapsed footpath slab over drain creating hidden foot trap',
      description: 'Pedestrian pavement slab cracked in half; pedestrians walking onto the fast lane to bypass.',
      category: 'Public infrastructure',
      address: 'Cunningham Road, Near Police Station',
      lat: 12.9880,
      lng: 77.5970,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'PID',
      status: 'ASSIGNED',
      daysAgo: 4,
    },
    {
      title: 'Children playground swing chain broken and frame unstable',
      description: 'Metal support pipe corroded through at ground level in public park.',
      category: 'Public infrastructure',
      address: 'Coles Park Playground, Fraser Town',
      lat: 12.9960,
      lng: 77.6110,
      urgency: 'Medium',
      safetyRisk: true,
      deptCode: 'PID',
      status: 'SUBMITTED',
      daysAgo: 6,
    },
    {
      title: 'Deep excavation trench left without barricades or warning lamps',
      description: 'Contractor excavated 6ft trench across road and left at night without any lights or caution tape.',
      category: 'Public safety',
      address: 'Old Airport Road near Domlur Flyover',
      lat: 12.9600,
      lng: 77.6350,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'PSV',
      status: 'IN_PROGRESS',
      daysAgo: 1,
    },
    {
      title: 'Aggressive stray dog pack chasing two-wheelers at blind turn',
      description: 'Pack of 8 stray dogs repeatedly attacking delivery drivers and morning joggers.',
      category: 'Public safety',
      address: 'HSR Layout Sector 1, 19th Main',
      lat: 12.9120,
      lng: 77.6480,
      urgency: 'High',
      safetyRisk: true,
      deptCode: 'PSV',
      status: 'ASSIGNED',
      daysAgo: 2,
    },
    {
      title: 'Leaning eucalyptus tree branch resting on high tension power cable',
      description: 'Branch heavy with rainwater is pushing power cables downwards, sparking during wind.',
      category: 'Public safety',
      address: 'Sadashivnagar 11th Cross',
      lat: 13.0060,
      lng: 77.5810,
      urgency: 'Critical',
      safetyRisk: true,
      deptCode: 'PSV',
      status: 'ASSIGNED',
      daysAgo: 1,
    },
  ];

  console.log(`[Seed] Processing ${rawSeedTemplates.length} realistic complaint records...`);

  const createdComplaints: any[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < rawSeedTemplates.length; i++) {
    const tmpl = rawSeedTemplates[i];
    const seq = String(i + 1).padStart(5, '0');
    const complaintId = `CP-${currentYear}-${seq}`;

    const submissionDate = new Date();
    submissionDate.setDate(submissionDate.getDate() - tmpl.daysAgo);
    submissionDate.setHours(9 + (i % 8), 15 + (i * 7) % 45, 0, 0);

    const priorityResult = calculatePriorityScore({
      urgencyLevel: tmpl.urgency,
      safetyRisk: tmpl.safetyRisk,
      category: tmpl.category,
      description: tmpl.description,
      nearbyOpenCount: i < 5 ? 4 : i < 10 ? 3 : 1,
      categoryHistoryCount: 4,
    });

    const citizen = i % 2 === 0 ? citizen1 : citizen2;
    const dept = tmpl.deptCode ? createdDepts[tmpl.deptCode] : undefined;

    const complaint = new Complaint({
      complaintId,
      citizenId: citizen._id,
      citizenName: citizen.name,
      citizenEmail: citizen.email,
      title: tmpl.title,
      description: tmpl.description,
      category: tmpl.category,
      imageUrls: [
        tmpl.category === 'Waterlogging'
          ? 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'
          : tmpl.category === 'Roads and potholes'
            ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
            : tmpl.category === 'Waste management'
              ? 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80'
              : tmpl.category === 'Streetlights'
                ? 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80'
                : 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80',
      ],
      address: tmpl.address,
      latitude: tmpl.lat,
      longitude: tmpl.lng,
      status: tmpl.status,
      priority: priorityResult.priority,
      priorityScore: priorityResult.score,
      priorityBreakdown: priorityResult.breakdown,
      priorityReasoning: priorityResult.reasoning,
      aiSummary: tmpl.description.slice(0, 110) + '...',
      aiCategory: tmpl.category,
      aiUrgency: tmpl.urgency,
      aiImpact: tmpl.safetyRisk ? 'Public safety risk & transit bottleneck' : 'Civic maintenance requirement',
      aiSafetyRisk: tmpl.safetyRisk,
      aiStatus: 'SUCCESS',
      aiModel: 'gemini-1.5-flash',
      assignedDepartmentId: dept ? dept._id : undefined,
      assignedOfficerId: tmpl.officer ? tmpl.officer._id : undefined,
      assignedAt: dept ? new Date(submissionDate.getTime() + 4 * 3600000) : undefined,
      assignmentRemarks: dept ? `Assigned to ${dept.name} for prompt field inspection.` : undefined,
      resolutionRemarks: tmpl.status === 'RESOLVED' ? 'Issue inspected and fully rectified by municipal duty crew. Verified by field engineer.' : undefined,
      resolvedAt: tmpl.status === 'RESOLVED' ? new Date(submissionDate.getTime() + 36 * 3600000) : undefined,
      createdAt: submissionDate,
      updatedAt: tmpl.status === 'RESOLVED' ? new Date(submissionDate.getTime() + 36 * 3600000) : submissionDate,
    });

    await complaint.save();
    createdComplaints.push(complaint);

    await ComplaintHistory.create({
      complaintId,
      changedBy: citizen._id,
      changedByName: citizen.name,
      previousStatus: 'NEW',
      newStatus: 'SUBMITTED',
      remarks: 'Lodged via CivicPulse AI Portal.',
      timestamp: submissionDate,
    });

    if (tmpl.status !== 'SUBMITTED') {
      await ComplaintHistory.create({
        complaintId,
        changedBy: admin._id,
        changedByName: admin.name,
        previousStatus: 'SUBMITTED',
        newStatus: tmpl.status,
        remarks: tmpl.status === 'RESOLVED' ? 'Resolution verified by municipal commissioner office.' : 'Status advanced after supervisory inspection.',
        timestamp: new Date(submissionDate.getTime() + 6 * 3600000),
      });
    }

    await AIAnalysis.create({
      complaintId,
      modelName: 'gemini-1.5-flash',
      processingStatus: 'SUCCESS',
      category: tmpl.category,
      summary: tmpl.description.slice(0, 120),
      urgency: tmpl.urgency,
      impact: tmpl.safetyRisk ? 'Critical public safety factor' : 'Municipal maintenance notice',
      safetyRisk: tmpl.safetyRisk,
      reasoning: priorityResult.reasoning,
      duplicateResults: [],
      priorityBreakdown: {
        ...priorityResult.breakdown,
        total: priorityResult.score,
      },
      generatedAt: submissionDate,
    });
  }

  // Populate duplicate candidates
  for (const c of createdComplaints) {
    const dups = detectDuplicates(
      {
        complaintId: c.complaintId,
        title: c.title,
        description: c.description,
        category: c.category,
        latitude: c.latitude,
        longitude: c.longitude,
      },
      createdComplaints.map((item) => ({
        complaintId: item.complaintId,
        title: item.title,
        description: item.description,
        category: item.category,
        latitude: item.latitude,
        longitude: item.longitude,
        status: item.status,
      }))
    );

    if (dups.length > 0) {
      c.duplicateCandidates = dups;
      await c.save();
      await AIAnalysis.findOneAndUpdate({ complaintId: c.complaintId }, { duplicateResults: dups });
    }
  }

  // Initial alerts
  await Notification.create({
    recipientId: admin._id,
    complaintId: 'CP-2026-00001',
    title: 'Critical Civic Alert: Waterlogging Cluster',
    message: 'Multiple waterlogging reports detected around MG Road Metro corridor. Coordinated action required.',
    type: 'HOTSPOT_ALERT',
    isRead: false,
  });

  await Notification.create({
    recipientId: citizen1._id,
    complaintId: 'CP-2026-00001',
    title: 'Work In Progress: MG Road Waterlogging',
    message: 'Senior Officer Rajesh Kumar (Drainage & Sanitation) has commenced suction clearing work on site.',
    type: 'STATUS_UPDATE',
    isRead: false,
  });

  console.log(`[Seed] Seeded ${createdComplaints.length} records successfully.`);
}

export async function runStandaloneSeed() {
  await connectDB();
  await seedDatabaseData();
  await disconnectDB();
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runStandaloneSeed().catch((err) => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}
