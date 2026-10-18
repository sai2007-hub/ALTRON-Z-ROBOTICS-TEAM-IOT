import {
  EventItem,
  WorkshopItem,
  ProjectItem,
  AchievementItem,
  GalleryItem,
  TeamMember,
  Registration,
} from '../types';

export const initialEvents: EventItem[] = [
  {
    id: 'evt-1',
    slug: 'robo-sumo',
    title: 'Robo Sumo Championship 2026',
    category: 'Combat',
    shortDescription: 'High-torque autonomous and RC heavyweight sumo wrestling bots clash on an official steel ring.',
    fullDescription: 'Robo Sumo is ALTRON\'Z flagship combat engineering challenge. Two autonomous or teleoperated robotic vehicles enter the ring, and only one leaves. Bots must detect opponent positions with ultrasonic and infrared arrays, maintain traction with neodymium magnet downforce arrays, and push opponents out of the circular dohyo within 3-minute bouts.',
    rules: [
      'Maximum robot weight: 3.0 kg (including all batteries and weapons).',
      'Maximum starting footprint: 20 cm x 20 cm (unlimited expansion permitted once match begins).',
      'Autonomous bots must observe a strict 5.0-second delay upon match referee start signal.',
      'No electro-magnetic jamming, liquid dispersal, or entanglement devices allowed.',
      'Dohyo diameter: 154 cm black steel surface with 5 cm white border line.',
      'Best of 3 rounds per match. A robot touching the exterior floor loses the round.'
    ],
    dimensionsAndSpecs: [
      'Weight limit: 3000g max',
      'Starting dimensions: 200mm x 200mm',
      'Ring diameter: 1540mm Dohyo',
      'Power: Max 24V DC battery supply',
      'Control: RC 2.4GHz or fully autonomous'
    ],
    date: 'November 14, 2026',
    time: '09:00 AM - 05:30 PM',
    venue: 'ALTRON\'Z Arena - Tech Complex Hall A',
    registrationDeadline: 'November 05, 2026',
    capacity: 32,
    registeredCount: 24,
    entryFee: '$25 per team',
    teamSize: '2 to 4 members',
    status: 'published',
    highlights: ['Cash pool $1,500', 'Official Dohyo arena', 'Precision weigh-in inspection', 'Live telemetry stream']
  },
  {
    id: 'evt-2',
    slug: 'robo-soccer',
    title: 'Robo Soccer Invitational 2026',
    category: 'Sports',
    shortDescription: 'Agile omni-directional robots engage in high-octane 2-versus-2 tactical robotic football.',
    fullDescription: 'Robo Soccer tests precision maneuvering, low-latency teleoperation, and ball-handling mechanics. Equipped with 3-wheel or 4-wheel omni drives, brushless motors, and high-energy solenoid kickers, teams battle to dribble, pass, and shoot modulated infrared mini-balls into the opponent goal.',
    rules: [
      'Each team fields two active robots (1 Striker, 1 Goalkeeper/Support).',
      'Robot footprint: 22 cm diameter cylinder, maximum height 22 cm.',
      'Ball possession rule: Robot dribbler cannot engulf more than 20% of ball diameter.',
      'Match duration: Two 7-minute halves with a 3-minute halftime strategy break.',
      'Kicking mechanism: Max velocity compliant with arena safety standards (solenoid or spring-actuated).',
      'Fouls: Intentional ramming into the goalkeeper inside the penalty crease results in penalty shootout.'
    ],
    dimensionsAndSpecs: [
      'Pitch size: 240cm x 180cm artificial turf',
      'Goal dimensions: 60cm width, 25cm height',
      'Ball: Standard electronic pulsing IR beacon ball (75mm diameter)',
      'Drive: Omni-wheel / Mecanum / differential drive allowed',
      'Power: Up to 16.8V LiPo (4S)'
    ],
    date: 'November 15, 2026',
    time: '10:00 AM - 06:00 PM',
    venue: 'Field Hall B - Mechatronics Center',
    registrationDeadline: 'November 06, 2026',
    capacity: 24,
    registeredCount: 19,
    entryFee: '$30 per team',
    teamSize: '3 to 5 members',
    status: 'published',
    highlights: ['Pulsing IR soccer ball', 'Standardized pitch', 'Referee video replay', '$1,800 Prize pool']
  },
  {
    id: 'evt-3',
    slug: 'maze-runner',
    title: 'Micro-Mouse & Autonomous Maze Runner',
    category: 'Autonomous',
    shortDescription: 'Autonomous speed-demons mapping and navigating complex 16x16 mazes in record time.',
    fullDescription: 'The pinnacle of embedded algorithms. Autonomous robots must explore an unknown 16x16 orthogonal labyrinth, compute optimal shortest-path trajectories using Floodfill or A* search, and execute high-speed speed runs without any human contact.',
    rules: [
      'Robot must be 100% self-contained and autonomous (no remote telemetry/commands).',
      'Size constraint: 18 cm x 18 cm max during exploration.',
      'Scoring: Score = Best Run Time + (Total Search Time / 30) - Penalties.',
      'Maze walls are 5 cm high with 16.8 cm cell clearances.'
    ],
    dimensionsAndSpecs: [
      '16 x 16 cell standard competition maze',
      'Wall thickness: 12mm',
      'Cell pitch: 180mm',
      'Sensors allowed: Optical, LiDAR, Ultrasonic, IMU'
    ],
    date: 'November 14, 2026',
    time: '01:00 PM - 06:00 PM',
    venue: 'Robotics Lab 3 - Systems Wing',
    registrationDeadline: 'November 08, 2026',
    capacity: 20,
    registeredCount: 15,
    entryFee: '$20 per team',
    teamSize: '1 to 3 members',
    status: 'published',
    highlights: ['Precision laser-cut maze', 'Electronic start/finish timing gates', 'Algorithm workshops prior to run']
  },
  {
    id: 'evt-4',
    slug: 'drone-obstacle',
    title: 'Precision Drone Obstacle Challenge',
    category: 'Aerial',
    shortDescription: 'Pilot micro-quadcopters through illuminated acrobatic rings, tunnels, and wind chambers.',
    fullDescription: 'An intense aerial navigation challenge testing pilot agility and autonomous stability. Drone pilots maneuver custom micro-quads through laser-lit rings, tight zig-zags, variable wind turbulence corridors, and precision landing pads.',
    rules: [
      'Frame size: Sub-250g class (propeller guards strictly mandatory).',
      'FPV frequency: Assigned 5.8GHz video channel or digital HD link.',
      'Three timed attempts per pilot. Missed gates add 5-second penalty each.'
    ],
    dimensionsAndSpecs: [
      'Max weight: 250 grams with battery',
      'Propeller size: Max 3.5 inches',
      'Failsafe: Auto-disarm required within 1.0s of signal loss'
    ],
    date: 'November 15, 2026',
    time: '01:30 PM - 05:30 PM',
    venue: 'Open Quad Outdoor Enclosure',
    registrationDeadline: 'November 07, 2026',
    capacity: 16,
    registeredCount: 12,
    entryFee: '$20 per pilot',
    teamSize: '1 to 2 members',
    status: 'published',
    highlights: ['Illuminated LED race gates', 'Safety netting enclosure', 'Live FPV spectator monitors']
  }
];

export const initialWorkshops: WorkshopItem[] = [
  {
    id: 'ws-1',
    slug: 'hands-on-robotics-esp32',
    title: 'Hands-On Robotics: Differential Drive to Autonomous Navigation',
    track: 'Robotics',
    targetAudience: 'Schools',
    duration: '2 Days (12 Hours)',
    schedule: 'Every Saturday & Sunday',
    venue: 'Partner Schools & ALTRON\'Z STEM Lab',
    capacity: 40,
    registeredCount: 36,
    description: 'An intensive, hands-on workshop tailored for students. Participants assemble a working 2-wheeled robotic chassis, wire motor drivers (L298N/DRV8833), interface infrared and ultrasonic sensors, and program PID wall-following and obstacle-avoidance logic.',
    modules: [
      'Chassis mechanics, motor sizing, and gear ratios',
      'Microcontroller fundamentals (ESP32 / Arduino)',
      'Sensor interfacing: HC-SR04 ultrasonic & TCRT5000 IR arrays',
      'PID control algorithms for line tracking',
      'Bluetooth & WiFi teleoperation app integration'
    ],
    hardwareProvided: ['2WD Robot Kit', 'ESP32 Development Board', 'Motor Driver', 'Battery Pack & Cable set', 'Sensor Modules'],
    prerequisites: 'Basic curiosity in technology. No prior programming needed.',
    status: 'published',
    featured: true
  },
  {
    id: 'ws-2',
    slug: 'iot-sensor-to-cloud',
    title: 'Industrial IoT: Sensor-to-Cloud Telemetry & MQTT Dashboards',
    track: 'IoT',
    targetAudience: 'Colleges',
    duration: '3 Days (18 Hours)',
    schedule: 'Scheduled with Host Engineering Colleges',
    venue: 'Host College IoT Lab / ALTRON\'Z Campus',
    capacity: 50,
    registeredCount: 42,
    description: 'Deep dive into practical IoT architectures for engineering undergraduates. From analog sensor calibration to MQTT message brokers, Node-RED, and real-time cloud analytics for industrial monitoring.',
    modules: [
      'IoT Network Topologies: WiFi, BLE, and LoRaWAN fundamentals',
      'Secure telemetry protocols: MQTT with TLS and HTTP REST',
      'Deploying lightweight brokers (Mosquitto) and Node-RED pipelines',
      'Cloud storage and real-time dashboard visualizers',
      'Over-the-Air (OTA) firmware update architecture'
    ],
    hardwareProvided: ['ESP32 NodeMCU DevKit', 'DHT22, Soil, and Current Transducers', 'OLED I2C Displays', 'Cloud Sandbox Access'],
    prerequisites: 'C/C++ basics or Python familiarity.',
    status: 'published',
    featured: true
  },
  {
    id: 'ws-3',
    slug: 'embedded-firmware-arm',
    title: 'Embedded Systems & Bare-Metal Firmware on ARM Cortex-M',
    track: 'Embedded Systems',
    targetAudience: 'Colleges',
    duration: '2 Days (14 Hours)',
    schedule: 'Monthly Weekend Intensives',
    venue: 'ALTRON\'Z Hardware R&D Facility',
    capacity: 30,
    registeredCount: 22,
    description: 'Bypass Arduino abstraction layers and write bare-metal C on ARM Cortex-M microcontrollers. Learn direct register manipulation, interrupt service routines (NVIC), timer PWM generation, and FreeRTOS task scheduling.',
    modules: [
      'ARM Cortex-M Architecture, memory map, and startup code',
      'Register-level GPIO, SysTick, and hardware timers',
      'UART, SPI, and I2C hardware peripheral drivers from scratch',
      'Interrupt latency, NVIC priority grouping, and DMA transfers',
      'Introduction to FreeRTOS multitasking and semaphores'
    ],
    hardwareProvided: ['STM32 Nucleo Board', 'USB Logic Analyzer', 'ST-LINK Programmer', 'Course Workbook'],
    prerequisites: 'Intermediate C programming and digital electronics fundamentals.',
    status: 'published',
    featured: true
  },
  {
    id: 'ws-4',
    slug: 'ros2-computer-vision',
    title: 'Computer Vision & ROS2 for Autonomous Mobile Robots',
    track: 'AI & Vision',
    targetAudience: 'Colleges',
    duration: '3 Days (18 Hours)',
    schedule: 'Quarterly Advanced Bootcamp',
    venue: 'ALTRON\'Z Computer Vision Lab',
    capacity: 25,
    registeredCount: 18,
    description: 'Bridge software and hardware robotics with Robot Operating System (ROS2) and OpenCV. Implement color thresholding, AprilTag localization, 2D LiDAR SLAM, and Nav2 path planning on real robots.',
    modules: [
      'ROS2 Nodes, Topics, Services, and Actions architecture',
      'OpenCV image processing pipelines: filtering, contours, and object tracking',
      'AprilTag visual fiducial markers for indoor robot localization',
      'Laser scan processing & Cartographer SLAM mapping',
      'Autonomous navigation with Nav2 costmaps and trajectory planners'
    ],
    hardwareProvided: ['Single Board Computer (Raspberry Pi 5)', 'USB HD Camera', 'RPLiDAR A1 Sensor', 'Differential Bot Platform'],
    prerequisites: 'Python 3 and basic Linux terminal proficiency.',
    status: 'published',
    featured: false
  }
];

export const initialProjects: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'Apex Sumo Titan v3',
    category: 'Competition Bot',
    summary: 'A 3kg titanium-wedge combat robot designed for national Robo Sumo championships.',
    description: 'Engineered from aeronautical grade 7075 aluminum and heat-treated AR400 armor steel. Driven by dual custom high-torque brushless DC outrunners with planetary gearboxes yielding 12 Nm of stalling torque, paired with active neodymium magnetic skirts delivering 45 kg of downforce on steel rings.',
    technologies: ['SolidWorks CAD', 'BLDC Outrunners', 'ESP32 Dual-Core', 'Neodymium Magnetic Skirts', 'Optical Line Trackers'],
    status: 'Active',
    teamLead: 'Rohan Verma',
    hardwareSpecs: [
      { label: 'Weight', value: '2985 grams' },
      { label: 'Stall Torque', value: '12.4 Nm' },
      { label: 'Magnetic Downforce', value: '450 N (approx 45kgf)' },
      { label: 'Response Time', value: '3.8 ms' },
      { label: 'Battery', value: '6S LiPo (22.2V 1300mAh 100C)' }
    ]
  },
  {
    id: 'proj-2',
    title: 'Tri-Omni Striker MK-II',
    category: 'Competition Bot',
    summary: 'High-speed omnidirectional soccer robot with pneumatic kicker and 360-degree ball sensor.',
    description: 'Features a 3-wheel symmetric 120-degree holonomic drive platform enabling independent translation and rotation. Equipped with custom infrared receiver rings to track modulated 40kHz beacon balls and an onboard boost-converter charging a 400V capacitor bank for high-velocity solenoid kicks.',
    technologies: ['Holonomic Kinematics', '400V Solenoid Kicker', 'STM32F405', '360° IR Ring Array', 'Custom PCB'],
    status: 'Active',
    teamLead: 'Priya Nair',
    hardwareSpecs: [
      { label: 'Drive Mechanism', value: '3x Custom 58mm Omni-wheels' },
      { label: 'Max Velocity', value: '3.2 m/s omnidirectional' },
      { label: 'Kicking Energy', value: '14.2 Joules (400V Discharge)' },
      { label: 'Controller', value: 'STM32 ARM Cortex-M4 @ 168MHz' },
      { label: 'Ball Detection', value: '16-channel IR array' }
    ]
  },
  {
    id: 'proj-3',
    title: 'AgroPulse: Autonomous Telemetry Rover',
    category: 'IoT Solution',
    summary: 'An all-terrain rover monitoring micro-climates, soil moisture, and crop health via LoRaWAN.',
    description: 'Built for rural agricultural research and campus greenhouses. Employs a 6-wheel Rocker-Bogie suspension to navigate rough furrows, deploying automated probes to measure soil NPK, pH, moisture, and transmitting sensor payloads up to 8 km via LoRaWAN to cloud monitoring stations.',
    technologies: ['Rocker-Bogie Chassis', 'LoRaWAN 868MHz', 'ESP32-S3', 'Solar MPPT Charger', 'Soil NPK Sensor'],
    status: 'Active',
    teamLead: 'Ananya Deshmukh',
    hardwareSpecs: [
      { label: 'Suspension', value: 'Rocker-Bogie with passive differential' },
      { label: 'Range', value: 'Up to 8.5 km line-of-sight' },
      { label: 'Power Autonomy', value: 'Indefinite (50W Solar + LiFePO4)' },
      { label: 'Telemetry', value: 'LoRaWAN + ThingsBoard Cloud' }
    ]
  },
  {
    id: 'proj-4',
    title: 'Chronos 6-DOF Robotic Arm',
    category: 'Research Prototype',
    summary: 'Open-hardware 6-axis articulated manipulator with inverse kinematics and 3D vision pick-and-place.',
    description: 'Designed as a hands-on training instrument for industrial robotics. Utilizes closed-loop stepper motors with magnetic rotary encoders on cycloidal speed reducers. Integrated with ROS2 MoveIt framework for trajectory planning and collision avoidance.',
    technologies: ['ROS2 MoveIt', 'Cycloidal Drives', 'TMC2209 Drivers', 'OpenCV Color Segmentation', 'Python'],
    status: 'Active',
    teamLead: 'Siddharth Sen',
    hardwareSpecs: [
      { label: 'Payload', value: '1.2 kg at max reach' },
      { label: 'Reach', value: '620 mm' },
      { label: 'Repeatability', value: '±0.15 mm' },
      { label: 'Kinematics', value: 'Analytical 6-DOF IK Solver' }
    ]
  }
];

export const initialAchievements: AchievementItem[] = [
  {
    id: 'ach-1',
    title: 'National Robocup Championship - 1st Place',
    eventName: 'All-India Inter-Collegiate Robotics Cup 2026',
    year: 2026,
    rankOrAward: 'Championship Trophy & Gold Medal',
    category: 'National',
    description: 'ALTRON\'Z soccer robot squad secured undefeated victory through 8 tournament matches, conceding only 2 goals.',
    teamMembers: ['Priya Nair', 'Aarav Sharma', 'Rohan Verma', 'Karthik Rajan'],
    certificateId: 'NRC-2026-CHAMP-01'
  },
  {
    id: 'ach-2',
    title: 'International Mechatronics Summit - Gold Award',
    eventName: 'Asia-Pacific Robo Sumo Invitational 2025',
    year: 2025,
    rankOrAward: '1st Place & Best Mechanical Innovation',
    category: 'International',
    description: 'Our Apex Sumo bot outlasted 48 competitor robots from 6 countries, setting a tournament record for the fastest push-out in 4.2 seconds.',
    teamMembers: ['Rohan Verma', 'Aarav Sharma', 'Siddharth Sen'],
    certificateId: 'IMS-SUMO-GOLD-2025'
  },
  {
    id: 'ach-3',
    title: 'Best Embedded IoT System Award',
    eventName: 'Smart India Engineering Expo 2025',
    year: 2025,
    rankOrAward: 'Best Innovation Trophy & $1,000 Grant',
    category: 'National',
    description: 'Awarded for AgroPulse rover demonstrating resilient long-range LoRa telemetry under adverse outdoor weather conditions.',
    teamMembers: ['Ananya Deshmukh', 'Priya Nair'],
    certificateId: 'SIEE-IOT-2025'
  },
  {
    id: 'ach-4',
    title: 'Micro-Mouse Fastest Run Runner-Up',
    eventName: 'National Autonomous Systems League 2024',
    year: 2024,
    rankOrAward: '2nd Place (Silver)',
    category: 'National',
    description: 'Achieved a speed-run time of 11.4 seconds in the 16x16 labyrinth using diagonal floodfill optimization.',
    teamMembers: ['Siddharth Sen', 'Aarav Sharma'],
    certificateId: 'NASL-MM-2024-02'
  },
  {
    id: 'ach-5',
    title: 'Best STEM Outreach Organization',
    eventName: 'Youth Robotics Foundation Honors 2024',
    year: 2024,
    rankOrAward: 'Excellence in STEM Education Honor',
    category: 'Regional',
    description: 'Recognized for conducting over 30 free hands-on robotics introductory clinics for underprivileged government schools.',
    teamMembers: ['Karthik Rajan', 'Aarav Sharma', 'ALTRON\'Z Volunteers'],
    certificateId: 'YRF-STEM-2024'
  }
];

export const initialGallery: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Robo Sumo Arena Finals Clash',
    eventOrWorkshop: 'National Robocup 2026',
    year: 2026,
    category: 'Competition',
    caption: 'Titan v3 engaging in high-traction push-out against reigning regional champion bot.',
    svgType: 'sumo'
  },
  {
    id: 'gal-2',
    title: 'Omni-Soccer Tactical Match',
    eventOrWorkshop: 'Robo Soccer Invitational 2026',
    year: 2026,
    category: 'Competition',
    caption: 'Tri-Omni bot executing a 360-degree spin maneuver to redirect an infrared ball into the goal.',
    svgType: 'soccer'
  },
  {
    id: 'gal-3',
    title: 'High School Hands-On IoT Clinic',
    eventOrWorkshop: 'STEM Outreach Camp',
    year: 2026,
    category: 'Workshop',
    caption: 'Grade 10 students testing real-time temperature and soil moisture readouts on ESP32 web dashboards.',
    svgType: 'workshop'
  },
  {
    id: 'gal-4',
    title: 'AgroPulse Field Telemetry Trials',
    eventOrWorkshop: 'Campus Botanical R&D',
    year: 2025,
    category: 'Lab & R&D',
    caption: 'Testing 6-wheel Rocker-Bogie traverse capabilities across rocky outdoor terrain.',
    svgType: 'rover'
  },
  {
    id: 'gal-5',
    title: 'Bare-Metal STM32 Oscilloscope Tuning',
    eventOrWorkshop: 'Advanced Embedded Systems Session',
    year: 2025,
    category: 'Workshop',
    caption: 'Inspecting PWM duty cycles and SPI bus jitter on digital storage oscilloscopes.',
    svgType: 'lab'
  },
  {
    id: 'gal-6',
    title: 'Drone Waypoint Navigation Test',
    eventOrWorkshop: 'Autonomous Flight Testing',
    year: 2025,
    category: 'Lab & R&D',
    caption: 'Testing optical flow position-hold stability inside the outdoor obstacle netting cage.',
    svgType: 'drone'
  }
];

export const initialTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Aarav Sharma',
    role: 'Team Captain & Systems Architect',
    subsystem: 'Leadership',
    bio: 'Senior Mechatronics undergraduate with 4 years of competition robotics experience. Oversees robot system integration, budget allocation, and tournament logistics.',
    yearAndDept: 'Final Year, B.Tech Mechatronics',
    skills: ['System Architecture', 'Control Theory', 'C++', 'CAD Assembly'],
    email: 'aarav.sharma@altronz.org',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    isLead: true
  },
  {
    id: 'tm-2',
    name: 'Priya Nair',
    role: 'Embedded Systems & Electronics Lead',
    subsystem: 'Embedded & Firmware',
    bio: 'Firmware enthusiast specializing in ARM Cortex-M microcontrollers, RTOS scheduling, and custom PCB power distribution for high-drain robotics motors.',
    yearAndDept: '3rd Year, Electronics & Communication',
    skills: ['STM32 Bare-Metal', 'FreeRTOS', 'KiCad PCB Design', 'Power Electronics'],
    email: 'priya.nair@altronz.org',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    isLead: true
  },
  {
    id: 'tm-3',
    name: 'Rohan Verma',
    role: 'Mechanical Design & Fabrication Lead',
    subsystem: 'Mechanical & CAD',
    bio: 'Passionate about stress FEA analysis, lightweight topology optimization, and precision CNC/3D printing. Principal designer of the Apex Sumo Titan series.',
    yearAndDept: 'Final Year, Mechanical Engineering',
    skills: ['SolidWorks', 'ANSYS FEA', 'CNC Machining', 'Material Selection'],
    email: 'rohan.verma@altronz.org',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    isLead: true
  },
  {
    id: 'tm-4',
    name: 'Siddharth Sen',
    role: 'Computer Vision & AI Lead',
    subsystem: 'Computer Vision & AI',
    bio: 'Builds SLAM mapping, AprilTag visual odometry, and edge inference pipelines using ROS2, Python, and OpenCV for autonomous rovers and soccer robots.',
    yearAndDept: '3rd Year, Computer Science',
    skills: ['ROS2 Humble', 'OpenCV', 'LiDAR SLAM', 'Python Algorithms'],
    email: 'siddharth.sen@altronz.org',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    isLead: false
  },
  {
    id: 'tm-5',
    name: 'Ananya Deshmukh',
    role: 'IoT & Telemetry Lead',
    subsystem: 'Embedded & Firmware',
    bio: 'Focuses on low-power long-range communications, LoRa telemetry, ESP-NOW mesh networking, and responsive web visualization dashboards.',
    yearAndDept: '3rd Year, Electrical & Electronics',
    skills: ['LoRaWAN', 'MQTT Brokers', 'ESP32 Firmware', 'Node-RED'],
    email: 'ananya.deshmukh@altronz.org',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    isLead: false
  },
  {
    id: 'tm-6',
    name: 'Karthik Rajan',
    role: 'STEM Outreach & Workshop Director',
    subsystem: 'Operations & Outreach',
    bio: 'Coordinates robotics bootcamps across 40+ schools and colleges. Curates accessible curriculum, kit inventory, and mentorship programs for aspiring young roboticists.',
    yearAndDept: 'Final Year, Instrumentation Tech',
    skills: ['Curriculum Design', 'Workshop Logistics', 'Mentorship', 'Public Speaking'],
    email: 'karthik.rajan@altronz.org',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    isLead: false
  }
];

export const initialRegistrations: Registration[] = [
  {
    id: 'REG-8491',
    studentName: 'Vikramaditya Roy',
    email: 'vikram.roy@mit-tech.edu',
    phone: '+1 (555) 349-8201',
    schoolOrCollege: 'Massachusetts Institute of Technology / Tech Institute',
    departmentOrClass: '3rd Year B.S. Robotics',
    targetType: 'event',
    targetId: 'evt-1',
    targetTitle: 'Robo Sumo Championship 2026',
    teamName: 'Titan Breakers',
    teamSize: 3,
    teammateDetails: 'Vikramaditya Roy (Lead), Elena Rostova, Marcus Chen',
    experienceLevel: 'Advanced',
    timestamp: '2026-10-14 14:32:10',
    status: 'confirmed'
  },
  {
    id: 'REG-8492',
    studentName: 'Sarah Jenkins',
    email: 'sarah.j@standford.edu',
    phone: '+1 (555) 782-9114',
    schoolOrCollege: 'Stanford University School of Engineering',
    departmentOrClass: '2nd Year Electrical Engineering',
    targetType: 'event',
    targetId: 'evt-2',
    targetTitle: 'Robo Soccer Invitational 2026',
    teamName: 'OmniVanguard',
    teamSize: 4,
    teammateDetails: 'Sarah Jenkins, David Kim, Priya Patel, Leo Vance',
    experienceLevel: 'Intermediate',
    timestamp: '2026-10-14 16:15:22',
    status: 'confirmed'
  },
  {
    id: 'REG-8493',
    studentName: 'Devon Miller',
    email: 'devon.miller@oakridgehigh.org',
    phone: '+1 (555) 234-5678',
    schoolOrCollege: 'Oakridge STEM High School',
    departmentOrClass: 'Grade 11, Science Stream',
    targetType: 'workshop',
    targetId: 'ws-1',
    targetTitle: 'Hands-On Robotics: Differential Drive to Autonomous Navigation',
    teamName: 'Solo Registrant',
    teamSize: 1,
    teammateDetails: 'N/A',
    experienceLevel: 'Beginner',
    timestamp: '2026-10-15 09:20:45',
    status: 'confirmed'
  },
  {
    id: 'REG-8494',
    studentName: 'Chloe Bennett',
    email: 'c.bennett@berkeley.edu',
    phone: '+1 (555) 678-1234',
    schoolOrCollege: 'UC Berkeley Mechatronics Club',
    departmentOrClass: 'Final Year Mechanical Eng',
    targetType: 'event',
    targetId: 'evt-1',
    targetTitle: 'Robo Sumo Championship 2026',
    teamName: 'Vortex Wedge',
    teamSize: 2,
    teammateDetails: 'Chloe Bennett, Tyler Ross',
    experienceLevel: 'Advanced',
    timestamp: '2026-10-15 11:42:01',
    status: 'confirmed'
  },
  {
    id: 'REG-8495',
    studentName: 'Aditya Kulkarni',
    email: 'aditya.k@coep.ac.in',
    phone: '+1 (555) 901-4432',
    schoolOrCollege: 'College of Engineering & Technology',
    departmentOrClass: '3rd Year Electronics & Telecom',
    targetType: 'workshop',
    targetId: 'ws-2',
    targetTitle: 'Industrial IoT: Sensor-to-Cloud Telemetry & MQTT Dashboards',
    teamName: 'Solo Registrant',
    teamSize: 1,
    teammateDetails: 'N/A',
    experienceLevel: 'Intermediate',
    timestamp: '2026-10-15 13:05:19',
    status: 'confirmed'
  }
];
