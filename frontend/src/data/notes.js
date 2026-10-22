// Sample Academic Notes Dataset for NoteNest
// Designed for CSE Undergraduate Engineering curriculum

export const INITIAL_NOTES = [
  {
    id: "note-1",
    title: "DBMS Unit 1 — Introduction to Databases & ER Modeling",
    description: "Comprehensive handwritten revision notes covering database architectures (1-tier, 2-tier, 3-tier), Entity-Relationship (ER) diagrams, weak entities, participation constraints, and relational schema conversions with solved university exam problems.",
    subject: "Database Management Systems",
    semester: 4,
    topic: "ER Diagrams & Relational Algebra",
    uploader: "Aarav Sharma",
    uploaderEmail: "aarav.sharma@college.edu",
    uploadDate: "2026-03-12",
    fileType: "PDF",
    fileSize: "4.2 MB",
    downloads: 342,
    previewPages: 18,
    tags: ["ER Model", "Relational Algebra", "Schemas", "Exam Prep"],
    keyConcepts: [
      "Three-schema architecture and data independence",
      "Entity types, attributes, and key constraints",
      "Specialization, generalization, and aggregation in Extended ER",
      "Relational algebra fundamental operators (Select, Project, Join, Union)"
    ]
  },
  {
    id: "note-2",
    title: "Operating Systems — Virtual Memory & Page Replacement",
    description: "Detailed exam-oriented lecture notes covering paging, segmentation, page fault handling, FIFO, LRU, Optimal page replacement algorithms with step-by-step trace tables, and thrashing prevention mechanisms.",
    subject: "Operating Systems",
    semester: 4,
    topic: "Memory Management",
    uploader: "Priya Nair",
    uploaderEmail: "priya.nair@college.edu",
    uploadDate: "2026-03-05",
    fileType: "PDF",
    fileSize: "3.8 MB",
    downloads: 418,
    previewPages: 14,
    tags: ["Paging", "LRU Algorithm", "Virtual Memory", "Thrashing"],
    keyConcepts: [
      "Hardware address translation with Translation Lookaside Buffer (TLB)",
      "Internal vs External Fragmentation solutions",
      "Belady's Anomaly demonstrated with FIFO algorithm",
      "Working set model and page fault frequency metrics"
    ]
  },
  {
    id: "note-3",
    title: "Data Structures — Trees, AVL Rotations & Graph Traversals",
    description: "High-yield diagrams and C++ implementations for Binary Search Trees, AVL balance factors with Left-Left, Right-Right, Left-Right, Right-Left rotations, BFS, DFS, and shortest path Dijkstra formulations.",
    subject: "Data Structures",
    semester: 3,
    topic: "Non-Linear Data Structures",
    uploader: "Rohan Varma",
    uploaderEmail: "rohan.varma@college.edu",
    uploadDate: "2026-02-18",
    fileType: "PDF",
    fileSize: "5.6 MB",
    downloads: 620,
    previewPages: 22,
    tags: ["AVL Trees", "Graphs", "BFS/DFS", "Dijkstra"],
    keyConcepts: [
      "Binary search tree insertion, deletion, and searching amortized times",
      "Height balancing properties and AVL rotation logic",
      "Adjacency matrix vs Adjacency list representation",
      "Topological sorting algorithms for directed acyclic graphs"
    ]
  },
  {
    id: "note-4",
    title: "Computer Networks — The OSI 7-Layer Architecture & TCP/IP",
    description: "Visual breakdown of every layer in the OSI reference model compared directly to the 4-layer TCP/IP stack. Includes packet headers, encapsulation diagrams, port numbers, and protocol mappings (DNS, HTTP, TCP, UDP, IP, ARP).",
    subject: "Computer Networks",
    semester: 5,
    topic: "Network Models & Protocols",
    uploader: "Sneha Mukherjee",
    uploaderEmail: "sneha.m@college.edu",
    uploadDate: "2026-03-20",
    fileType: "PDF",
    fileSize: "4.9 MB",
    downloads: 289,
    previewPages: 16,
    tags: ["OSI Model", "TCP/IP", "Encapsulation", "Protocols"],
    keyConcepts: [
      "Encapsulation and decapsulation walkthrough from application to physical layer",
      "Flow control, congestion control, and 3-way handshake in TCP",
      "IP addressing, subnetting masks, and Classless Inter-Domain Routing (CIDR)",
      "Address Resolution Protocol (ARP) frame structures"
    ]
  },
  {
    id: "note-5",
    title: "Java OOP — Inheritance, Interfaces & Polymorphism Cheatsheet",
    description: "Core Java programming companion covering Object-Oriented principles, abstract classes vs interfaces, method overriding, super keyword nuances, exceptional hierarchy, and standard collection framework cheat sheet.",
    subject: "Object-Oriented Programming",
    semester: 3,
    topic: "Polymorphism & Interfaces",
    uploader: "Devansh Mehta",
    uploaderEmail: "devansh.mehta@college.edu",
    uploadDate: "2026-01-29",
    fileType: "PDF",
    fileSize: "2.7 MB",
    downloads: 512,
    previewPages: 12,
    tags: ["Java", "OOP", "Interfaces", "Polymorphism"],
    keyConcepts: [
      "Runtime polymorphism (dynamic method dispatch) in Java",
      "Default and static methods in Java 8+ interfaces",
      "Checked vs Unchecked exceptions best practices",
      "Generics syntax and Java Collections framework classes"
    ]
  },
  {
    id: "note-6",
    title: "Full Stack Development — Modern React Hooks & REST API Architecture",
    description: "Practical guide to React component lifecycles using useState, useEffect, useMemo, and custom hooks. Features architectural patterns for connecting React frontends to Express/Node.js REST endpoints with clean CORS and fetch handling.",
    subject: "Full Stack Development",
    semester: 5,
    topic: "Frontend Frameworks & API Integration",
    uploader: "Ananya Iyer",
    uploaderEmail: "ananya.iyer@college.edu",
    uploadDate: "2026-03-28",
    fileType: "PDF",
    fileSize: "3.4 MB",
    downloads: 480,
    previewPages: 20,
    tags: ["React.js", "Hooks", "REST API", "State Management"],
    keyConcepts: [
      "Component state vs props unidirection data flow",
      "Effect dependencies and cleanup functions to avoid memory leaks",
      "Async/await data fetching with loading and error boundaries",
      "RESTful HTTP methods (GET, POST, PUT, DELETE) and status code semantics"
    ]
  },
  {
    id: "note-7",
    title: "Operating Systems — CPU Scheduling Algorithms with Solved Gantt Charts",
    description: "Step-by-step solved numericals for FCFS, Shortest Job First (Preemptive & Non-Preemptive), Priority Scheduling, and Round Robin (Quantum = 2ms). Contains turnaround time and waiting time calculation formulas.",
    subject: "Operating Systems",
    semester: 4,
    topic: "CPU Scheduling",
    uploader: "Karan Patel",
    uploaderEmail: "karan.patel@college.edu",
    uploadDate: "2026-02-14",
    fileType: "PDF",
    fileSize: "3.1 MB",
    downloads: 375,
    previewPages: 11,
    tags: ["Gantt Chart", "Round Robin", "SJF", "Scheduling"],
    keyConcepts: [
      "Preemptive vs non-preemptive scheduling tradeoffs",
      "Gantt chart construction for complex multi-burst arrival times",
      "Average waiting time (AWT) and turnaround time (TAT) formulas",
      "Starvation in priority scheduling and aging mitigation"
    ]
  },
  {
    id: "note-8",
    title: "Database Management Systems — Normalization (1NF to BCNF) Master Guide",
    description: "Definitive guide to Functional Dependencies, finding candidate keys, Armstrong's Axioms, and step-by-step decomposition into First Normal Form (1NF), 2NF, 3NF, and Boyce-Codd Normal Form with lossless-join proofs.",
    subject: "Database Management Systems",
    semester: 4,
    topic: "Normalization & Functional Dependencies",
    uploader: "Tanvi Saxena",
    uploaderEmail: "tanvi.saxena@college.edu",
    uploadDate: "2026-03-16",
    fileType: "PDF",
    fileSize: "4.5 MB",
    downloads: 590,
    previewPages: 17,
    tags: ["Normalization", "BCNF", "3NF", "Candidate Keys"],
    keyConcepts: [
      "Closure of an attribute set and determining candidate keys",
      "Partial dependency elimination in 2NF",
      "Transitive dependency elimination in 3NF",
      "BCNF strict super-key condition and dependency preservation tradeoffs"
    ]
  },
  {
    id: "note-9",
    title: "Computer Networks — Subnetting, CIDR & IP Routing Algorithms",
    description: "Quick subnetting cheat sheet with power-of-2 table, FLSM vs VLSM network design exercises, Link State (Dijkstra) vs Distance Vector (Bellman-Ford) routing protocols, and count-to-infinity problem analysis.",
    subject: "Computer Networks",
    semester: 5,
    topic: "Network Layer & Routing",
    uploader: "Arjun Reddy",
    uploaderEmail: "arjun.reddy@college.edu",
    uploadDate: "2026-03-01",
    fileType: "PDF",
    fileSize: "4.1 MB",
    downloads: 310,
    previewPages: 15,
    tags: ["Subnetting", "CIDR", "Distance Vector", "Dijkstra"],
    keyConcepts: [
      "Subnet mask calculation for variable size departments",
      "Broadcast address and usable host range determination",
      "Distance Vector routing and split horizon solution",
      "Link State routing packet flooding and OSPF foundations"
    ]
  },
  {
    id: "note-10",
    title: "Data Structures — Dynamic Programming & Greedy Algorithms",
    description: "Clear recursive to iterative conversion notes for classic algorithms: 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, Huffman Coding, and Minimum Spanning Trees (Kruskal & Prim).",
    subject: "Data Structures",
    semester: 3,
    topic: "Algorithm Design & Complexity",
    uploader: "Ishita Sen",
    uploaderEmail: "ishita.sen@college.edu",
    uploadDate: "2026-02-25",
    fileType: "PDF",
    fileSize: "5.1 MB",
    downloads: 445,
    previewPages: 19,
    tags: ["Dynamic Programming", "Greedy", "Knapsack", "Algorithms"],
    keyConcepts: [
      "Overlapping subproblems and optimal substructure characteristics",
      "Memoization (Top-down) vs Tabulation (Bottom-up)",
      "Fractional Knapsack (Greedy) vs 0/1 Knapsack (DP) contrast",
      "Disjoint set union-find data structure for Kruskal's algorithm"
    ]
  },
  {
    id: "note-11",
    title: "Full Stack Development — Express.js Middleware & JWT Authentication Flow",
    description: "Practical backend architecture handbook explaining Express router setups, error-handling middleware chains, bcrypt password hashing, JSON Web Token (JWT) signing & verification in HTTP Authorization headers.",
    subject: "Full Stack Development",
    semester: 5,
    topic: "Backend Node.js & Security",
    uploader: "Vikram Malhotra",
    uploaderEmail: "vikram.m@college.edu",
    uploadDate: "2026-04-02",
    fileType: "PDF",
    fileSize: "3.7 MB",
    downloads: 270,
    previewPages: 14,
    tags: ["Express.js", "JWT", "Middleware", "Authentication"],
    keyConcepts: [
      "Request-Response cycle and next() function mechanics",
      "Custom authentication middleware guards",
      "Salt rounds and asynchronous bcrypt hashing",
      "JWT payload structure (header, payload, signature)"
    ]
  },
  {
    id: "note-12",
    title: "Object-Oriented Programming — C++ Memory Management & Smart Pointers",
    description: "Deep dive into pointers, references, dynamic heap allocation with new/delete, copy constructors, rule of three/five, RAII idiom, and modern C++ smart pointers (std::unique_ptr, std::shared_ptr, std::weak_ptr).",
    subject: "Object-Oriented Programming",
    semester: 3,
    topic: "Pointers & Memory Architecture",
    uploader: "Meera Joshi",
    uploaderEmail: "meera.joshi@college.edu",
    uploadDate: "2026-01-15",
    fileType: "PDF",
    fileSize: "3.2 MB",
    downloads: 360,
    previewPages: 13,
    tags: ["C++", "Smart Pointers", "Memory Leaks", "RAII"],
    keyConcepts: [
      "Stack memory vs Heap memory performance characteristics",
      "Dangling pointers, memory leaks, and double free bugs",
      "Resource Acquisition Is Initialization (RAII) idiom",
      "Reference counting in std::shared_ptr and cyclic reference prevention"
    ]
  }
];

export const SUBJECTS = [
  "All Subjects",
  "Data Structures",
  "Database Management Systems",
  "Operating Systems",
  "Computer Networks",
  "Object-Oriented Programming",
  "Full Stack Development"
];

export const SEMESTERS = [
  { value: "all", label: "All Semesters" },
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
  { value: "5", label: "Semester 5" },
  { value: "6", label: "Semester 6" },
  { value: "7", label: "Semester 7" },
  { value: "8", label: "Semester 8" }
];

export const SUBJECT_METADATA = {
  "Data Structures": {
    code: "CS201",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: "Network",
    description: "Trees, Graphs, Sorting, Dynamic Programming & Complexity"
  },
  "Database Management Systems": {
    code: "CS302",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    icon: "Database",
    description: "ER Modeling, Relational Algebra, SQL & Normalization"
  },
  "Operating Systems": {
    code: "CS304",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    icon: "Cpu",
    description: "Processes, Threads, CPU Scheduling & Memory Management"
  },
  "Computer Networks": {
    code: "CS401",
    color: "#0D9488",
    bg: "#F0FDFA",
    border: "#99F6E4",
    icon: "Globe",
    description: "OSI Stack, TCP/IP, Subnetting & Routing Protocols"
  },
  "Object-Oriented Programming": {
    code: "CS203",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    icon: "Code",
    description: "Java, C++, Inheritance, Polymorphism & Design Patterns"
  },
  "Full Stack Development": {
    code: "CS405",
    color: "#4F46E5",
    bg: "#EEF2FF",
    border: "#C7D2FE",
    icon: "Layers",
    description: "React, Node.js, REST APIs & Modern Web Engineering"
  }
};

export const INITIAL_REPORTS = [
  {
    id: "rep-1",
    noteId: "note-4",
    noteTitle: "Computer Networks — The OSI 7-Layer Architecture & TCP/IP",
    reason: "Missing diagrams in Section 4 (Transport layer header)",
    details: "Page 9 seems to have a truncated image of the TCP segment header.",
    reporter: "kavita.k@college.edu",
    date: "2026-04-10",
    status: "Pending"
  },
  {
    id: "rep-2",
    noteId: "note-7",
    noteTitle: "Operating Systems — CPU Scheduling Algorithms with Solved Gantt Charts",
    reason: "Calculation error in Question 3",
    details: "The average turnaround time in question 3 Round Robin quantum=2 was calculated as 8.5ms instead of 9.25ms.",
    reporter: "siddharth.m@college.edu",
    date: "2026-04-12",
    status: "Pending"
  }
];
