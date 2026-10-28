import {
  EventItem,
  WorkshopItem,
  ProjectItem,
  AchievementItem,
  GalleryItem,
  TeamMember,
  Registration,
  HomepageStat,
  FooterAboutConfig,
  ContactPageConfig,
} from '../types';

export const initialEvents: EventItem[] = [
  {
    id: 'evt-closed-1',
    slug: 'robo-combat-league-2025',
    title: 'National Robo Combat League 2025',
    category: 'Combat',
    shortDescription: 'Heavyweight combat bot championship concluded in Autumn 2025.',
    fullDescription: 'The previous season national combat league, concluded with 32 competing university teams.',
    rules: ['Combat rules as per 2025 league regulations.'],
    dimensionsAndSpecs: ['Weight limit: 3000g max', 'Power: Max 24V DC'],
    date: 'October 18, 2025',
    time: '10:00 AM - 06:00 PM',
    venue: 'National Tech Arena',
    registrationDeadline: 'October 10, 2025',
    capacity: 32,
    registeredCount: 32,
    entryFee: '$25 per team',
    teamSize: '2 to 4 members',
    status: 'archived',
    highlights: ['Concluded Event', 'Official 2025 archive']
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
    status: 'confirmed',
    attendanceRecorded: false,
    attended: false
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
    status: 'confirmed',
    attendanceRecorded: true,
    attended: true,
    attendance: 'present',
    certificateIssued: true,
    certificateId: 'CERT-ALT-2026-SOC01'
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
    status: 'confirmed',
    attendanceRecorded: false,
    attended: false
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
    status: 'confirmed',
    attendanceRecorded: true,
    attended: true,
    attendance: 'present'
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
    status: 'confirmed',
    attendanceRecorded: false,
    attended: false
  },
  {
    id: 'REG-7101',
    studentName: 'Rohan Mehra',
    email: 'rohan.mehra@iitd.ac.in',
    phone: '+91 98765 43210',
    schoolOrCollege: 'Indian Institute of Technology Delhi',
    departmentOrClass: '3rd Year Mechanical Eng',
    targetType: 'event',
    targetId: 'evt-closed-1',
    targetTitle: 'National Robo Combat League 2025',
    teamName: 'Titan Breaker',
    teamSize: 3,
    teammateDetails: 'Rohan Mehra, Aniket Roy, Deepa Nair',
    experienceLevel: 'Advanced',
    timestamp: '2025-10-02 14:10:00',
    status: 'confirmed',
    attendanceRecorded: true,
    attended: true,
    attendance: 'present',
    certificateIssued: true,
    certificateId: 'CERT-ALT-2025-COMBAT-01'
  },
  {
    id: 'REG-7102',
    studentName: 'Meera Krishnan',
    email: 'meera.k@mitindia.edu',
    phone: '+91 94451 22334',
    schoolOrCollege: 'Madras Institute of Technology',
    departmentOrClass: '2nd Year Robotics & Automation',
    targetType: 'event',
    targetId: 'evt-closed-1',
    targetTitle: 'National Robo Combat League 2025',
    teamName: 'Iron Valkyrie',
    teamSize: 2,
    teammateDetails: 'Meera Krishnan, Harish S',
    experienceLevel: 'Intermediate',
    timestamp: '2025-10-04 11:25:30',
    status: 'confirmed',
    attendanceRecorded: true,
    attended: false,
    attendance: 'absent'
  }
];

export const initialHomepageStats: HomepageStat[] = [
  {
    id: 'stat-workshops-planned',
    title: 'Workshops Planned',
    value: 'Coming Soon',
    description: 'Hands-on robotics and IoT workshops are in preparation.',
    order: 1,
    updatedAt: '2026-10-22 00:00:00'
  },
  {
    id: 'stat-student-registrations',
    title: 'Student Registrations',
    value: '0',
    description: 'Be among the first to join our upcoming workshops.',
    order: 2,
    updatedAt: '2026-10-22 00:00:00'
  },
  {
    id: 'stat-competitions',
    title: 'Competitions',
    value: '2',
    description: 'Robo Sumo and Robo Soccer.',
    order: 3,
    updatedAt: '2026-10-22 00:00:00'
  },
  {
    id: 'stat-our-focus',
    title: 'Our Focus',
    value: 'Robotics + IoT',
    description: 'Building practical engineering skills through hands-on learning.',
    order: 4,
    updatedAt: '2026-10-22 00:00:00'
  }
];

export const initialFooterAboutConfig: FooterAboutConfig = {
  id: 'footerAbout',
  teamName: "ALTRON'Z ROBOTICS TEAM & IOT",
  shortDescription: "Student-driven robotics and autonomous engineering organization. We design competition-grade combat & soccer robots, build embedded IoT architectures, and conduct immersive STEM workshops for schools and colleges nationwide.",
  establishedYear: '2022',
  isEstablishedVerified: true,
  subtitle: 'Robotics & Embedded Systems',

  heroBadge: 'Engineering Identity & Pedagogy',
  heroTitle: 'Forging Autonomous Excellence Through Hardware First',
  heroDescription: "Founded by engineering undergraduates, ALTRON'Z ROBOTICS TEAM & IOT bridges the gap between textbook physics and high-stress competition robotics. We operate a dual mandate: competing at elite national tournaments and demystifying embedded hardware for thousands of school and college students through hands-on bootcamps.",
  
  missionTitle: 'Our Mission',
  missionDescription: 'To build competitive, resilient autonomous machines that push mechatronics boundaries, while making cutting-edge embedded systems, robotics, and IoT accessible to every curious young mind regardless of background or prior experience.',
  missionPoints: [
    'Zero-compromise hardware immersion with real microcontrollers.',
    'Free introductory STEM clinics for underprivileged high schools.',
    'Open-source hardware repositories for competition teams.'
  ],

  visionTitle: 'Our Vision',
  visionDescription: 'To establish an internationally recognized center of student engineering innovation where real-world problems in agriculture, disaster robotics, and industrial IoT are solved by undergraduate and school students working on tactile hardware.',
  visionPoints: [
    'Top-tier podium finishes in international Robocup leagues.',
    'Incubating patentable hardware startups from team student projects.',
    'Training 10,000+ certified young embedded engineers by 2028.'
  ],

  disciplines: [
    {
      id: 'disc-1',
      number: 'DISCIPLINE 01',
      disciplineNumber: 'DISCIPLINE 01',
      title: 'Competition Robotics',
      description: 'Design of combat sumo bots, holonomic omni-wheel soccer strikers, micro-mouse maze solvers, and aerial drones for timed circuit challenges.',
      iconType: 'cpu'
    },
    {
      id: 'disc-2',
      number: 'DISCIPLINE 02',
      disciplineNumber: 'DISCIPLINE 02',
      title: 'Industrial IoT & Telemetry',
      description: 'Low-power sensor telemetry using LoRaWAN, ESP-NOW, and MQTT with cloud dashboard pipelines for environmental monitoring and automated rovers.',
      iconType: 'wrench'
    },
    {
      id: 'disc-3',
      number: 'DISCIPLINE 03',
      disciplineNumber: 'DISCIPLINE 03',
      title: 'Bare-Metal Embedded Firmware',
      description: 'Low-level C programming on ARM Cortex-M microcontrollers, direct register access, interrupt service routines, DMA memory transfers, and FreeRTOS.',
      iconType: 'award'
    }
  ],

  competitionLinks: [
    { id: 'cl-1', label: 'Robo Sumo (3kg Class)', targetView: 'sumo' },
    { id: 'cl-2', label: 'Robo Soccer (Omni 2v2)', targetView: 'soccer' },
    { id: 'cl-3', label: 'Micro-Mouse Maze Runner', targetView: 'events' },
    { id: 'cl-4', label: 'Drone Obstacle Challenge', targetView: 'events' }
  ],

  workshopLinks: [
    { id: 'wl-1', label: 'School STEM Workshops', targetView: 'workshops' },
    { id: 'wl-2', label: 'College IoT & Telemetry', targetView: 'workshops' },
    { id: 'wl-3', label: 'Bare-Metal ARM Firmware', targetView: 'workshops' },
    { id: 'wl-4', label: 'Active Hardware Projects', targetView: 'projects' },
    { id: 'wl-5', label: 'Bot Details & Blueprints', targetView: 'bot-details' },
    { id: 'wl-6', label: 'Hall of Achievements', targetView: 'achievements' }
  ],

  labAddress: 'Robotics Innovation Center, Block 4, Tech Campus',
  officialEmail: 'contact@altronz.org',
  outreachEmail: 'workshops@altronz.org',
  contactPhone: '+1 (555) 726-2687',
  workingHours: 'Monday - Saturday: 08:30 AM - 08:00 PM',
  visitingNotice: 'Prior visitor authorization is required for campus entry to inspect our testing benches and competition rings.',

  copyrightText: "ALTRON'Z ROBOTICS TEAM & IOT. All rights reserved.",
  copyrightYear: '2026',
  footerLinks: [
    { id: 'fl-1', label: 'Team Charter', targetView: 'about' },
    { id: 'fl-2', label: 'Host a Workshop', targetView: 'contact' },
    { id: 'fl-3', label: 'Staff Login', targetView: 'login' }
  ]
};

export const initialContactPageConfig: ContactPageConfig = {
  id: 'contactPage',
  badge: "Get in Touch with ALTRON'Z ROBOTICS TEAM & IOT",
  title: 'Connect, Collaborate & Host Workshops',
  description: 'Whether you want to sponsor our competition squad, invite us to host a hardware workshop on your campus, or inquire about robotics rules, we are here to assist.',

  contactItems: [
    {
      id: 'ci-address',
      type: 'address',
      label: 'Engineering Lab & Test Arena',
      value: "ALTRON'Z Robotics Center, Block 4, Tech Innovation Campus, 400 Technology Way",
      enabled: true,
      isPlaceholder: true // Clearly flagged as unverified sample address
    },
    {
      id: 'ci-email-official',
      type: 'email',
      label: 'Official Electronic Mail',
      value: 'contact@altronz.org',
      subValue: 'workshops@altronz.org (Outreach)',
      link: 'mailto:contact@altronz.org',
      enabled: true,
      isPlaceholder: false
    },
    {
      id: 'ci-phone',
      type: 'phone',
      label: 'Direct Voice Line',
      value: '+1 (555) 726-2687 / +1 (555) ROBOTIC',
      link: 'tel:+15557262687',
      enabled: true,
      isPlaceholder: true // Clearly flagged as sample 555 phone number
    },
    {
      id: 'ci-hours',
      type: 'hours',
      label: 'Lab Working Hours',
      value: 'Monday - Saturday: 08:30 AM - 08:00 PM',
      enabled: true,
      isPlaceholder: false
    }
  ],

  showVisitingNotice: true,
  visitingNoticeTitle: 'Notice for Visiting Delegations:',
  visitingNoticeText: 'Prior visitor authorization is required for campus entry to inspect our testing benches and competition rings.',

  enquirySectionTitle: 'Workshop & Partnership Enquiry',
  enquirySectionDescription: 'Fill out the form below to receive a formal curriculum prospectus and fee quotation for your institution.',
  submitButtonText: 'Transmit Official Enquiry',
  successTitle: 'Enquiry Dispatched',
  successMessage: 'Your workshop request has been received. Our team will review the curriculum tracks and contact you within 24-48 business hours.',

  fieldLabels: {
    institutionName: 'School / College / Organization Name',
    contactPerson: 'Contact Person Name',
    institutionCategory: 'Institution Category',
    officialEmail: 'Official Email',
    contactPhone: 'Contact Phone Number',
    preferredTrack: 'Preferred Technical Track',
    targetTimeline: 'Target Timeline / Preferred Date',
    additionalDetails: 'Special Requirements & Workshop Scope'
  },

  institutionCategories: [
    'Engineering College',
    'High School',
    'University',
    'Organization / Corporate'
  ],

  technicalTracks: [
    'Robotics & Microcontrollers',
    'IoT & Wireless Telemetry',
    'Bare-Metal ARM Firmware',
    'Custom Integrated Bootcamps'
  ]
};


