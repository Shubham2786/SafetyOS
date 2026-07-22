\# SafetyOS: Product Requirements & System Design Document (PRSD)

\## The AI-Powered Industrial Safety Intelligence Platform for Zero-Harm Operations

\*\*Document Version:\*\* 1.0

\*\*Status:\*\* Approved for Engineering Handoff

\*\*Classification:\*\* Confidential — Product Blueprint

\*\*Authored by:\*\* Cross-Functional Product Organization (Principal PM, Principal Systems Architect, Industrial Safety Consultant, AI Research Engineer, Senior UX Architect, Staff Backend Engineer, Cloud Architect, Knowledge Graph Engineer, Computer Vision Engineer, OT/SCADA Integration Expert, Cybersecurity Architect, Startup CTO)

\*\*Target Audience:\*\* Engineering, Design, Data Science, Security, GTM, Executive Leadership, Regulatory Reviewers

\---

\## Table of Contents

1\. \[Executive Summary\](#1-executive-summary)

2\. \[Product Vision, Mission & Strategic Positioning\](#2-product-vision-mission--strategic-positioning)

3\. \[Problem Space & Market Analysis\](#3-problem-space--market-analysis)

4\. \[Target Personas & Jobs-To-Be-Done\](#4-target-personas--jobs-to-be-done)

5\. \[Product Principles & Non-Negotiables\](#5-product-principles--non-negotiables)

6\. \[System Architecture: The Layered View\](#6-system-architecture-the-layered-view)

7\. \[Data Sources, Ingestion & Semantic Fusion\](#7-data-sources-ingestion--semantic-fusion)

8\. \[Knowledge Graph Design\](#8-knowledge-graph-design)

9\. \[AI/ML Subsystems\](#9-aiml-subsystems)

10\. \[Multi-Agent Reasoning Layer\](#10-multi-agent-reasoning-layer)

11\. \[Computer Vision Pipeline\](#11-computer-vision-pipeline)

12\. \[Digital Twin & Geospatial Intelligence\](#12-digital-twin--geospatial-intelligence)

13\. \[Workflow Engines: PTW, LOTO, Shift Handover, Incident\](#13-workflow-engines-ptw-loto-shift-handover-incident)

14\. \[User Experience & Industrial HMI Design\](#14-user-experience--industrial-hmi-design)

15\. \[Mobile & Field Application\](#15-mobile--field-application)

16\. \[Data Model & Database Schemas\](#16-data-model--database-schemas)

17\. \[API Specification\](#17-api-specification)

18\. \[Security, Privacy & Compliance Architecture\](#18-security-privacy--compliance-architecture)

19\. \[Reliability, Observability & SRE\](#19-reliability-observability--sre)

20\. \[Deployment Topology\](#20-deployment-topology)

21\. \[KPIs, OKRs & Acceptance Criteria\](#21-kpis-okrs--acceptance-criteria)

22\. \[Risk Register\](#22-risk-register)

23\. \[Roadmap & Release Plan\](#23-roadmap--release-plan)

24\. \[Go-to-Market & Business Model\](#24-go-to-market--business-model)

25\. \[Appendices\](#25-appendices)

26\. \[Glossary\](#26-glossary)

\---

\## 1. Executive Summary

\### 1.1 The Thesis

Industrial fatalities are not a data problem — they are a \*\*fusion, reasoning, and cognitive-load problem\*\*. The Visakhapatnam Steel Plant coke-oven explosion in January 2025, in which eight workers died despite functional gas detectors, permit-to-work controls, and SCADA, is the archetypal failure mode: \*\*the signals existed; the intelligence layer did not\*\*.

\*\*SafetyOS\*\* is designed as the missing intelligence layer. It sits \*above\* SCADA, DCS, CCTV, PTW, LOTO, EHS, HRIS and regulatory corpora and \*below\* the human decision-makers who execute safety-critical actions. SafetyOS \*\*never actuates industrial equipment\*\*. It \*\*fuses, reasons, explains, and recommends\*\*. Certified Safety Instrumented Systems (SIS) and licensed humans execute.

\### 1.2 What SafetyOS Is (and Is Not)

| SafetyOS \*\*IS\*\* | SafetyOS \*\*IS NOT\*\* |

|---|---|

| A read-only intelligence layer over OT/IT/CV | A SCADA/DCS replacement |

| A compound-risk detection engine | Another CCTV analytics point tool |

| A knowledge-graph-centric reasoning platform | A generic EHS filing cabinet |

| A human-in-the-loop recommendation system | An autonomous actuator |

| ISA-101 / ISA-18.2 compliant HMI | A consumer-style colorful dashboard |

| Edge-first, offline-tolerant | Cloud-dependent for safety-critical inference |

| Explainable, regulation-aware | A black-box model |

\### 1.3 Headline Claims (Measurable)

| Claim | Measurement | Target (18-month post-deployment) |

|---|---|---|

| Reduce Serious Injury & Fatality (SIF) precursors | SIF-precursor detection rate vs. single-sensor baseline | ≥ 4.5× lift |

| Prediction lead time before incident threshold | Median lead time from earliest fused signal to incident-threshold breach | ≥ 8 minutes |

| False-negative rate on PPE + compound risks | Missed critical events / total ground-truth critical events | ≤ 0.8% |

| PTW/LOTO cognitive load reduction | Median permit-issue-to-approval time | −65% |

| Emergency Response first-10-minute coordination | Time from confirmed trigger to full evacuation broadcast + incident report draft | ≤ 90 seconds |

| Alarm rationalization | Nuisance alarms per operator per hour (ISA-18.2 target ≤ 6) | ≤ 5 |

\### 1.4 Strategic Wedge

SafetyOS enters via a \*\*Trojan Horse\*\*: Edge Computer Vision for PPE, forklift proximity, and slip/fall detection — deployable on existing CCTV in days, delivering immediate SIF-precursor visibility. It then expands into PTW/LOTO orchestration, then into OT fusion via OPC-UA, then into predictive analytics, then into the Digital Twin. Each phase is independently ROI-positive; the platform effect compounds.

\---

\## 2. Product Vision, Mission & Strategic Positioning

\### 2.1 Vision

\> \*\*A world where no worker enters a hazardous situation that the data already predicted.\*\*

\### 2.2 Mission

To fuse every safety-relevant signal in an industrial facility into a single explainable intelligence layer that gives humans decisive foresight, not hindsight.

\### 2.3 Strategic Positioning Map

\`\`\`mermaid

quadrantChart

title Industrial Safety Software — Positioning (2026)

x-axis "Compliance / Records" --> "Real-time / Predictive"

y-axis "Single Modality" --> "Multi-Modal Fusion"

quadrant-1 "SafetyOS Frontier"

quadrant-2 "Legacy EHS"

quadrant-3 "Paper / Excel"

quadrant-4 "CV-Only AI"

"Intelex": \[0.25, 0.30\]

"Cority": \[0.30, 0.35\]

"Enablon": \[0.28, 0.32\]

"VelocityEHS": \[0.35, 0.30\]

"SafetyCulture iAuditor": \[0.40, 0.20\]

"Intenseye": \[0.75, 0.35\]

"Protex AI": \[0.72, 0.30\]

"Everguard.ai": \[0.70, 0.40\]

"SafetyOS": \[0.90, 0.92\]

\`\`\`

\### 2.4 The Moat

1\. \*\*The Multi-Modal Safety Knowledge Graph\*\* — a canonical semantic representation of every worker, asset, permit, hazard, telemetry stream and regulation.

2\. \*\*Compound-risk inference primitives\*\* — reusable reasoning patterns (Hot-Work-Near-Gas, Confined-Space-During-Startup, LOTO-Bypass-During-Handover, etc.) codified as executable graph queries + agent workflows.

3\. \*\*Regulation-Aware AI Governance\*\* — every recommendation cites its regulatory and SOP evidence, satisfying EU AI Act "high-risk" transparency obligations by construction.

4\. \*\*Industrial-grade UX debt\*\* — ISA-101 fluency that consumer AI companies cannot replicate without years of field time.

\---

\## 3. Problem Space & Market Analysis

\### 3.1 The Fatal Pattern

Across DGFASLI, OSHA and MHIDAS datasets, the modal fatal incident is \*\*compound\*\*: two or more sub-critical conditions co-occur, none of which independently breaches an alarm threshold. Examples:

\- Hot work permit + rising LEL (Lower Explosive Limit) trend in adjacent zone

\- Confined space entry + shift handover + degraded gas detector (past-due calibration)

\- LOTO removed on Line-3 + Line-3 pump commanded ON by adjacent operator

\- Forklift geofence breach + pedestrian in same aisle during shift change

Single-sensor systems detect none of these until the last-second breach. \*\*SafetyOS is architected around this compound-risk primitive.\*\*

\### 3.2 Market Sizing

| Segment | 2025 TAM | 2030 Projection | CAGR |

|---|---|---|---|

| EHS Software (global) | $7.06 B | $11.4 B | 10.1% |

| Industrial AI / IIoT | $43.6 B | $110 B | 20.4% |

| Computer Vision for Safety | $2.1 B | $8.9 B | 33.4% |

| \*\*SafetyOS SAM (Fusion Layer)\*\* | \*\*$3.9 B\*\* | \*\*$14.5 B\*\* | \*\*30.0%\*\* |

\### 3.3 Competitive Landscape

| Vendor | Category | Strength | Gap SafetyOS Exploits |

|---|---|---|---|

| Intelex | Legacy EHS | Root-cause tooling, configurability | No real-time OT/CV fusion |

| Cority | Legacy EHS | Occupational health, ESG | No sub-second CV, thin agentic layer |

| Enablon | Legacy EHS | Enterprise risk | Deployment 9–18 months, no edge |

| SafetyCulture | Mobile Audits | Field UX | No OT, no fusion, no reasoning |

| Intenseye | CV-AI | Edge CV, 50+ risk classes | No PTW/LOTO, no OT ingestion, thin KG |

| Protex AI | CV-AI | Silent-loss detection | No agentic layer, no regulatory RAG |

| Everguard.ai | CV-AI | Crane/kinetic hazards | Narrow domain |

| \*\*SafetyOS\*\* | \*\*Intelligence Layer\*\* | \*\*Multi-modal fusion + KG + Agents + ISA-101\*\* | \*\*—\*\* |

\### 3.4 Regulatory Landscape

| Regulation | Jurisdiction | Applicability to SafetyOS |

|---|---|---|

| OSHA 1910 (US) | US general industry | Recommendation citations, incident reporting |

| OSHA 1926 (US) | US construction | Fall protection, PPE |

| OISD-105/106/155 | India oil & gas | PTW, hot-work, gas detection |

| DGMS Circulars | India mining | Confined space, LOTO |

| Factories Act 1948 (India) | India general industry | Incident reporting timelines |

| ISO 45001 | Global OH&S | Management system audit trails |

| ISO 27001 / SOC 2 | Global infosec | Platform certification |

| IEC 61511 / 61508 | Global functional safety | \*\*Boundary: SafetyOS is NOT an SIS\*\* |

| ISA-101 / ISA-18.2 | Global HMI & alarms | Native UX compliance |

| EU AI Act (High-Risk) | EU | Explainability, human oversight, logging |

| GDPR / DPDP Act (India) | EU / India | Worker biometrics, video privacy |

\---

\## 4. Target Personas & Jobs-To-Be-Done

\### 4.1 Persona Matrix

| Persona | Role | Environment | JTBD | Success Criterion | Primary SafetyOS Surface |

|---|---|---|---|---|---|

| Ravi (Field Operator) | Executes work | Plant floor, gloves, PPE | "Get the job done and go home safe" | Zero-friction permits, clear hazards | Mobile app (voice-first) |

| Priya (Contractor) | Turnaround maintenance | Unfamiliar plant | "Understand this site fast" | Localized JSA, site orientation | Mobile app + Passport |

| Sanjay (Shift Supervisor) | Coordinates crew | Field + control room | "No surprises this shift" | Consolidated shift picture | Tablet / Kiosk |

| Anita (Control Room Operator) | Monitors DCS/SCADA | Control room | "Stay ahead of the plant" | Rationalized alarms, situational awareness | Level-1/2 Command Console |

| Deepak (HSE Manager) | Owns safety KPIs | Office + walkdown | "Prove ISO 45001 & prevent SIF" | Leading indicators, audit-ready | Dashboard + Reports |

| Meena (Plant Head) | P&L + safety | Office | "Zero-harm and on plan" | Exec view, insurer negotiations | Executive Dashboard |

| Vikram (Safety Officer) | Investigates incidents | Field + office | "Find root cause fast" | RCA copilot, evidence timeline | Incident Console |

| Kavya (Compliance Auditor) | External audit | Site visits | "Verify claims" | Immutable audit trail | Auditor Portal |

| Arjun (IT/OT Engineer) | Integrations | Server room | "Nothing breaks the DCS" | Read-only OT, unidirectional gateways | Admin Console |

| Neha (CISO) | Enterprise security | HQ | "No new attack surface" | Zero-trust, air-gap options | Security Center |

\### 4.2 User Journeys

\#### 4.2.1 Ravi Requests a Hot-Work Permit

| Step | Ravi Does | SafetyOS Does | Cognitive Load | Latency |

|---|---|---|---|---|

| 1 | Opens app at Weld-Bay-4 | Auto-geolocates zone, pre-fills hazard class | Very Low | <1s |

| 2 | Says "hot work, cutting flange" | STT → intent parse → PTW draft | Very Low | 2s |

| 3 | Reviews AI-drafted JSA | Cites SOP-HW-14, OSHA 1910.252 | Low | 4s |

| 4 | Confirms co-workers by NFC | KG cross-checks certifications, LOTO status | Low | 1s |

| 5 | Submits | Compound-risk agent evaluates → supervisor review | None | 2s |

| 6 | Receives approval + hazard brief | Voice + haptic notification | Low | — |

\#### 4.2.2 Anita Faces an Alarm Flood

| Step | Anita Faces | SafetyOS Does |

|---|---|---|

| 1 | 47 alarms in 3 minutes | Alarm rationalization agent clusters into 3 root causes |

| 2 | Uncertain which is real | Compound-risk score ranks: 1 critical (LEL rise + hot work), 2 nuisance |

| 3 | Needs SOP | RAG copilot surfaces SOP-EMR-07 excerpt + past similar incident |

| 4 | Communicates | One-click voice broadcast to affected crew via mobile app |

\---

\## 5. Product Principles & Non-Negotiables

1\. \*\*Human safety over productivity.\*\* Every conflict resolves toward safety.

2\. \*\*Recommend, never actuate.\*\* SafetyOS is a Level-3 decision-support system (per SAE J3016 analogy), not an autonomous controller.

3\. \*\*Explainability by construction.\*\* Every alert cites (a) the data points, (b) the reasoning rule, (c) the regulation/SOP, (d) confidence, (e) the counterfactual.

4\. \*\*Low false negatives beat low false positives.\*\* SIF-precursor recall > 99.2%; nuisance alarms managed via rationalization.

5\. \*\*Edge-first for safety-critical inference.\*\* Cloud dependency for a hazard alert is unacceptable.

6\. \*\*Offline-tolerant.\*\* Mobile and edge nodes function fully during network partitions; CRDT-based sync on recovery.

7\. \*\*Read-only into OT.\*\* OPC-UA client mode only. Unidirectional data diode where required.

8\. \*\*Regulation-aware, not regulation-agnostic.\*\* RAG grounded in the correct jurisdictional corpus.

9\. \*\*ISA-101 grayscale by default.\*\* Color is a semantic resource, spent sparingly.

10\. \*\*Data minimization.\*\* Faces blurred in non-violation frames; retention policies per jurisdiction.

11\. \*\*Modular microservices.\*\* Each subsystem independently deployable, versionable, replaceable.

12\. \*\*Open integrations.\*\* OPC-UA, MQTT, Modbus, IEC 61850, REST, gRPC, Kafka connectors.

\---

\## 6. System Architecture: The Layered View

\### 6.1 Layered Reference Architecture

\`\`\`mermaid

flowchart TB

subgraph U\["User Layer"\]

U1\[Mobile App  
iOS/Android/RN\]

U2\[Command Console  
Next.js/Web\]

U3\[AI Copilot  
Multi-modal Chat\]

U4\[Auditor Portal\]

end

subgraph GW\["Gateway / Access Layer"\]

GW1\[API Gateway  
Kong/Envoy\]

GW2\[Auth  
OIDC + mTLS + SSO\]

GW3\[Rate Limit / WAF\]

end

subgraph ORCH\["Orchestration Layer"\]

O1\[Workflow Engine  
Temporal\]

O2\[Multi-Agent Layer  
LangGraph\]

O3\[Event Router  
Kafka\]

end

subgraph BRAIN\["Reasoning Layer"\]

B1\[Knowledge Graph  
Neo4j\]

B2\[Vector DB  
pgvector/Qdrant\]

B3\[Rule Engine  
Drools/OPA\]

B4\[LLM Gateway  
vLLM + Guardrails\]

end

subgraph DATA\["Data Layer"\]

D1\[Time-Series  
TimescaleDB\]

D2\[Relational  
PostgreSQL\]

D3\[Object Store  
S3/MinIO\]

D4\[Search  
OpenSearch\]

end

subgraph EDGE\["Edge Layer"\]

E1\[Edge AI  
Jetson Orin\]

E2\[Computer Vision  
YOLOv8/RT-DETR\]

E3\[IoT Gateway  
MQTT/OPC-UA Client\]

end

subgraph OT\["OT Layer (Read-Only)"\]

OT1\[SCADA/DCS\]

OT2\[PLC\]

OT3\[Historian\]

OT4\[CCTV DVR/NVR\]

end

subgraph INFRA\["Infrastructure"\]

I1\[Kubernetes\]

I2\[Service Mesh  
Istio\]

I3\[Monitoring  
Prometheus/Grafana\]

I4\[Security  
Vault/SIEM\]

end

U --> GW --> ORCH

ORCH <--> BRAIN

BRAIN <--> DATA

ORCH <--> EDGE

EDGE <--> OT

ORCH -.telemetry.-> INFRA

BRAIN -.telemetry.-> INFRA

DATA -.telemetry.-> INFRA

\`\`\`

\### 6.2 Layer Responsibility Matrix

| Layer | Owns | SLA | Failure Mode | Recovery |

|---|---|---|---|---|

| User | UI rendering, offline cache | 99.9% | Graceful degrade to read-only | Local cache |

| Gateway | AuthN, AuthZ, routing | 99.95% | Circuit break, 503 | Multi-AZ failover |

| Orchestration | Workflows, agent execution | 99.9% | Workflow retry, idempotency | Temporal replay |

| Reasoning | Inference, RAG, KG queries | 99.5% | Fallback to cached KG snapshot | Warm replicas |

| Data | Persistence | 99.99% | Read-only mode | Streaming replication |

| Edge | Sub-second CV, local buffer | 99.9% (local) | Buffer + resync | Store-and-forward |

| OT | External | N/A | Detected + alerted | Read-only, no writes |

\### 6.3 Deployment Zones (Purdue Model Alignment)

\`\`\`mermaid

flowchart LR

subgraph L0\["L0-L2 Process/Control"\]

S\[Sensors/PLC/DCS\]

end

subgraph L3\["L3 Manufacturing Ops"\]

H\[Historian\]

E\[Edge AI Nodes\]

end

subgraph DMZ\["L3.5 IDMZ"\]

DD\[Data Diode / Unidirectional Gateway\]

OPC\[OPC-UA Aggregator\]

end

subgraph L4\["L4-L5 Enterprise/Cloud"\]

K\[SafetyOS Core Cloud\]

UI\[Console/Mobile\]

end

S --> H

S --> E

H --> OPC

E --> DD

OPC --> DD

DD --> K

K --> UI

\`\`\`

\*\*Design rule:\*\* No SafetyOS control path crosses L3.5 southbound. All southbound flows are metadata (config, model updates) via signed, audited channels.

\---

\## 7. Data Sources, Ingestion & Semantic Fusion

\### 7.1 Source Catalog

| Source | Protocol | Cadence | Volume/Site/Day | Sensitivity |

|---|---|---|---|---|

| SCADA/DCS tags | OPC-UA (client) | 100 ms – 1 s | 5–50 GB | High |

| PLC | OPC-UA / Modbus TCP (read-only) | 100 ms | Included above | High |

| Historian (PI/Aspen/Ignition) | REST/OPC-HDA | Batch + streaming | 20–100 GB | High |

| CCTV | RTSP → Edge → Kafka events | 25–30 fps → event-based | 200 GB raw / 1 GB events | Very High (privacy) |

| IoT Wearables (gas, HR, motion) | MQTT / BLE → LoRaWAN | 1–10 s | 500 MB | High (biometric) |

| Shift Logs | Native app + import (JSON/CSV) | Per shift | 5 MB | Medium |

| PTW / LOTO | Native or SAP EHS / Maximo API | Event-driven | 50 MB | High |

| SOPs / Manuals | S3 upload + OCR | Static + updates | 500 MB corpus | Medium |

| Maintenance CMMS | Maximo / SAP PM REST | Event | 20 MB | Medium |

| Near-Miss / Incident | Native form | Event | 5 MB | High |

| Regulatory Corpus | Curated + versioned | Quarterly | 2 GB | Public |

\### 7.2 Ingestion Pipeline

\`\`\`mermaid

sequenceDiagram

participant OT as OT Source (SCADA/PLC)

participant EG as Edge Gateway

participant DD as Data Diode

participant K as Kafka (Cloud)

participant NORM as Normalizer

participant KG as Knowledge Graph

participant TS as TimescaleDB

participant AG as Agent Layer

OT->>EG: OPC-UA subscribe (read-only)

EG->>EG: Local buffer + schema validate

EG->>DD: Unidirectional push (TLS 1.3 + mTLS)

DD->>K: Kafka topic ot.raw..

K->>NORM: Stream consumer

NORM->>NORM: Unit conversion, dedup, tag→entity resolution

NORM->>TS: Time-series write (compressed hypertable)

NORM->>KG: Upsert Observation nodes + edges

KG-->>AG: Change data capture → agent triggers

AG->>AG: Compound-risk evaluation

\`\`\`

\### 7.3 Semantic Fusion Model

Every incoming signal is mapped to the canonical schema:

\`\`\`json

{

"observation\_id": "obs\_01HXK9...",

"source": { "type": "opcua", "gateway": "edge-vzp-01", "tag": "PT-4021" },

"entity\_ref": { "type": "Equipment", "id": "eq\_coke\_battery\_3" },

"measurement": { "name": "pressure", "value": 1.87, "unit": "bar", "quality": "GOOD" },

"timestamp": "2026-07-21T09:14:22.451Z",

"spatial\_ref": { "zone\_id": "zn\_coke\_oven\_north", "geom": "POINT(...)" },

"provenance": { "gateway\_signature": "sha256:...", "chain\_of\_custody": "..." },

"sensitivity": "operational",

"retention\_class": "T30"

}

\`\`\`

\### 7.4 Ingestion SLOs

| Path | p50 | p99 | Max Tolerable |

|---|---|---|---|

| OT tag → Edge Buffer | 50 ms | 150 ms | 300 ms |

| Edge → Cloud Kafka | 200 ms | 800 ms | 2 s |

| CV frame → Event | 90 ms | 250 ms | 500 ms (edge-local) |

| Fusion → KG upsert | 400 ms | 1.2 s | 3 s |

| Compound-risk detection | 1 s | 3 s | 5 s |

| Notification delivery | 500 ms | 2 s | 5 s |

\---

\## 8. Knowledge Graph Design

\### 8.1 Rationale

Relational schemas encode rows; safety is a \*\*relational, temporal, and spatial\*\* problem. The Knowledge Graph is the single semantic substrate on which every agent, rule, and query operates.

\### 8.2 Entity-Relationship Diagram

\`\`\`mermaid

erDiagram

WORKER ||--o{ CERTIFICATION : holds

WORKER ||--o{ SHIFT\_ASSIGNMENT : assigned\_to

WORKER ||--o{ WEARABLE\_READING : emits

WORKER }o--o{ PERMIT : listed\_on

CONTRACTOR ||--|| WORKER : is\_a

EQUIPMENT ||--o{ TAG : has\_tag

EQUIPMENT ||--o{ MAINTENANCE\_ORDER : subject\_of

EQUIPMENT ||--o{ LOTO\_POINT : has\_isolation

EQUIPMENT ||--o{ HAZARD\_CLASS : classified\_as

ZONE ||--o{ EQUIPMENT : contains

ZONE ||--o{ HAZARD\_ZONE\_CLASSIFICATION : classified

PERMIT ||--o{ HAZARD\_CLASS : addresses

PERMIT }o--|| ZONE : located\_in

PERMIT }o--o{ SOP : references

OBSERVATION }o--|| TAG : measures

OBSERVATION }o--|| ZONE : occurred\_in

CV\_EVENT }o--|| ZONE : detected\_in

CV\_EVENT }o--o{ WORKER : involves

INCIDENT ||--o{ OBSERVATION : evidenced\_by

INCIDENT ||--o{ CV\_EVENT : evidenced\_by

INCIDENT ||--o{ PERMIT : referenced

NEAR\_MISS ||--o{ OBSERVATION : evidenced\_by

REGULATION ||--o{ HAZARD\_CLASS : governs

SOP ||--o{ REGULATION : derived\_from

COMPOUND\_RISK ||--o{ OBSERVATION : composed\_of

COMPOUND\_RISK ||--o{ CV\_EVENT : composed\_of

COMPOUND\_RISK ||--o{ PERMIT : composed\_of

\`\`\`

\### 8.3 Node & Edge Ontology (Core Subset)

| Node Type | Key Properties | Purpose |

|---|---|---|

| \`Worker\` | id, name, role, certs\[\], org, is\_contractor | Identity |

| \`Equipment\` | id, type, hazard\_class, criticality | Physical asset |

| \`Zone\` | id, geom, hazardous\_area\_class (Zone 0/1/2) | Spatial |

| \`Permit\` | id, type, status, valid\_window, hazards\[\] | Workflow |

| \`LOTO\` | id, points\[\], applied\_by, verified\_by | Isolation |

| \`Observation\` | ts, name, value, unit, quality | Time-series anchor |

| \`CVEvent\` | ts, class, bbox, confidence, camera\_id | Vision output |

| \`Incident\` | id, severity, ts, narrative | Ground truth |

| \`NearMiss\` | id, ts, narrative | Leading indicator |

| \`SOP\` | id, version, hazard\_scope | Procedure |

| \`Regulation\` | id, jurisdiction, section | External rule |

| \`HazardClass\` | id, taxonomy (H2S, LEL, thermal, kinetic...) | Classification |

| \`CompoundRisk\` | id, pattern\_ref, score, active\_since | Inference output |

| Edge Type | Semantics |

|---|---|

| \`LOCATED\_IN\` | Worker/Equipment → Zone |

| \`HAS\_TAG\` | Equipment → Tag → Observation |

| \`AUTHORIZES\` | Permit → Work |

| \`ISOLATES\` | LOTO → Equipment |

| \`GOVERNED\_BY\` | HazardClass → Regulation |

| \`DERIVED\_FROM\` | SOP → Regulation |

| \`COMPOSES\` | Observation/CVEvent/Permit → CompoundRisk |

| \`PRECEDED\` | Observation → Incident (temporal, RCA) |

\### 8.4 Compound-Risk Query Example (Cypher)

\`\`\`cypher

// Hot-work + LEL rise in adjacent zone

MATCH (p:Permit {type:'HOT\_WORK', status:'ACTIVE'})-\[:LOCATED\_IN\]->(z:Zone)

MATCH (z)-\[:ADJACENT\_TO\*1..1\]-(z2:Zone)

MATCH (o:Observation {name:'LEL\_pct'})-\[:OCCURRED\_IN\]->(z2)

WHERE o.ts >= datetime() - duration('PT10M')

WITH p, z2, avg(o.value) AS lel\_avg, max(o.value) AS lel\_max,

stdev(o.value) AS lel\_std

WHERE lel\_max >= 10 OR (lel\_avg >= 5 AND lel\_std > 1.5)

CREATE (cr:CompoundRisk {

pattern:'HOT\_WORK\_LEL\_ADJACENT',

score: (lel\_max/10.0) \* 1.0,

active\_since: datetime(),

permit\_id: p.id,

zone\_id: z2.id

})

CREATE (cr)-\[:COMPOSES\]->(p)

RETURN cr;

\`\`\`

\### 8.5 KG Storage & Scaling

| Concern | Choice | Rationale |

|---|---|---|

| Primary store | Neo4j Enterprise Causal Cluster | Mature Cypher, ACID, RBAC |

| Federation for TS | TimescaleDB via APOC/PostgreSQL FDW | Keep hot TS out of KG |

| Vector | pgvector or Qdrant | RAG semantic layer |

| Snapshotting | Nightly + WAL streaming | RPO 60 s, RTO 15 min |

| Multi-tenant | Database-per-tenant + shared schema catalog | Isolation with governance |

\### 8.6 Tradeoffs

| Alternative | Why Not (Primary) |

|---|---|

| Pure relational (PG) | Recursive/temporal joins cost-prohibitive |

| Pure triple store (Blazegraph/Jena) | Weaker OLTP + tooling for enterprise |

| Property graph on TinkerPop (JanusGraph) | Ops complexity, weaker Cypher ecosystem |

| Graph-in-Postgres (AGE) | Immature for our scale |

\---

\## 9. AI/ML Subsystems

\### 9.1 Portfolio Map

\`\`\`mermaid

mindmap

root((SafetyOS AI))

Perception

YOLO PPE

Forklift Detection

Slip/Fall Detection

Pose Estimation

Fire/Smoke

License Plate for vehicles

Fusion

Compound Risk Engine

Temporal Alignment

Spatial Overlap

Reasoning

Multi-Agent Orchestrator

RAG Copilot

Rule Engine

Root Cause Analysis

Predictive

Gas Trend Forecasting

RUL / PHM

Fatigue Risk

Alarm Storm Prediction

Workflow AI

Permit Intelligence

LOTO Intelligence

Shift Handover AI

Compliance AI

Emergency

Plume Simulation

Evacuation Routing

Muster Verification

\`\`\`

\### 9.2 Model Registry (Illustrative)

| Model | Task | Base | Runtime | Location | Update Cadence |

|---|---|---|---|---|---|

| \`ppe-yolov8m-v3.2\` | PPE detection | YOLOv8m | TensorRT INT8 | Edge (Jetson Orin) | Monthly |

| \`forklift-rtdetr-v1.4\` | Vehicle detection | RT-DETR-L | TensorRT | Edge | Quarterly |

| \`slip-fall-x3d-v2.1\` | Action recognition | X3D-M | ONNX/TRT | Edge | Quarterly |

| \`pose-hrnet-w32\` | Ergonomics | HRNet | ONNX | Edge | Quarterly |

| \`fire-smoke-yolonas-v1.0\` | Fire/smoke | YOLO-NAS-S | TensorRT | Edge | Quarterly |

| \`gas-forecast-tft-v0.8\` | LEL/H2S forecast | Temporal Fusion Transformer | Triton | Cloud GPU | Monthly |

| \`phm-rul-nbeats-v1.2\` | RUL | N-BEATS | Triton | Cloud | Monthly |

| \`fatigue-tabnet-v0.5\` | Fatigue | TabNet on wearables | Triton | Cloud | Monthly |

| \`alarm-cluster-hdbscan\` | Alarm rationalization | HDBSCAN + Autoencoder | Python service | Cloud | Weekly |

| \`rag-copilot-llama3.1-70b-inst\` | RAG reasoning | Llama 3.1 70B Instruct + LoRA | vLLM | Cloud (option: on-prem) | Quarterly |

| \`rca-graph-gnn-v0.7\` | Root cause | Heterogeneous GNN | PyTorch Geometric | Cloud | Monthly |

| \`plume-cfd-surrogate-v0.3\` | Dispersion | PINN surrogate to FLACS/CFD | Triton | Cloud | Quarterly |

\### 9.3 MLOps Pipeline

\`\`\`mermaid

flowchart LR

A\[Data Curation  
Roboflow+Native Labeler\] --> B\[Feature Store  
Feast\]

B --> C\[Training  
Ray + PyTorch\]

C --> D\[Eval  
Weights & Biases\]

D --> E{Gates:  
Recall≥99.2%  
FN≤0.8%  
Bias Panel}

E -->|Pass| F\[Registry  
MLflow\]

E -->|Fail| A

F --> G\[Edge Packaging  
TensorRT INT8\]

F --> H\[Cloud Serving  
Triton/vLLM\]

G --> I\[Canary Edge  
5% sites\]

H --> J\[Shadow Mode  
7d\]

I --> K\[Full Rollout\]

J --> K

K --> L\[Live Monitoring  
Evidently+Custom\]

L -->|Drift| A

\`\`\`

\### 9.4 Evaluation Framework

| Model Class | Primary Metric | Secondary | Bias/Fairness | Safety Gate |

|---|---|---|---|---|

| PPE Detection | Recall@IoU0.5 ≥ 99.2% | Precision ≥ 92% | Skin-tone × helmet-color parity ≤ 2% Δ | FN escalation review |

| Forklift Proximity | Time-to-alert ≤ 500 ms | Precision ≥ 95% | Vehicle-type parity | 0 misses on pedestrian-in-lane |

| Compound Risk | SIF-precursor recall ≥ 99% | Alarm rate ≤ 3/shift | Shift/crew parity | Human review of all HIGH |

| RAG Copilot | Groundedness (citation match) ≥ 95% | Faithfulness ≥ 92% | Multilingual accuracy | Refusal on non-cited claims |

| RUL / PHM | RMSE reduction ≥ 20% vs. baseline | Coverage 95% PI | — | Never used for autonomous shutdown |

\### 9.5 Explainability Contract

Every AI recommendation MUST return an \`ExplanationBundle\`:

\`\`\`json

{

"recommendation\_id": "rec\_01HXK...",

"risk\_score": 0.87,

"confidence": 0.92,

"evidence": \[

{"type":"CVEvent","id":"cv\_...","confidence":0.94,"snapshot\_url":"..."},

{"type":"Observation","id":"obs\_...","tag":"LEL-4021","value":8.4,"unit":"%LEL"},

{"type":"Permit","id":"ptw\_...","clause":"hot\_work\_condition\_4"}

\],

"reasoning\_rule": "HOT\_WORK\_LEL\_ADJACENT@v2.1",

"regulatory\_citations": \[

{"id":"OSHA\_1910\_252(a)(2)(iv)","excerpt":"..."},

{"id":"OISD\_105\_5.3.2","excerpt":"..."}

\],

"sop\_citations": \[{"id":"SOP-HW-14","version":"3.2","excerpt":"..."}\],

"counterfactual": "If LEL had remained < 3%, recommendation would be MONITOR only.",

"human\_actions": \["SUSPEND\_PERMIT","EVAC\_ZONE\_B","VERIFY\_GAS\_TEST"\],

"not\_permitted\_ai\_actions": \["ACTUATE\_VALVE","OVERRIDE\_SIS"\]

}

\`\`\`

\---

\## 10. Multi-Agent Reasoning Layer

\### 10.1 Agent Roster

| Agent | Purpose | Inputs | Outputs | Autonomy Ceiling |

|---|---|---|---|---|

| Perception Agent | Consumes CV events | Kafka \`cv.events.\*\` | Enriched CVEvent nodes in KG | Enrichment only |

| Telemetry Agent | Consumes OT | Kafka \`ot.norm.\*\` | Observation nodes, anomaly flags | Enrichment |

| Permit Agent | PTW lifecycle | Permit forms, KG state | Draft JSA, conflict flags | Recommend |

| LOTO Agent | Isolation reasoning | LOTO forms, equipment state | Verification checklist, tampering flags | Recommend |

| Compound Risk Agent | Fusion inference | KG deltas | CompoundRisk nodes | Recommend |

| Emergency Response Agent | Incident orchestration | Confirmed trigger | Evac plan, notifications, IR-1 draft | Coordinate, never actuate |

| Incident Intelligence Agent | Post-event | Incident graph slice | Timeline, RCA hypotheses | Analyze |

| Shift Handover Agent | Handover summarization | Shift logs, open items | Structured handover packet | Recommend |

| Compliance Agent | ISO 45001 / OISD / DGMS | Audit trail, artifacts | Gap list, corrective actions | Recommend |

| RAG Copilot | Q&A | User query + KG + vectors | Grounded answer | Answer only |

| RCA Agent | Root cause | Incident graph + history | Ranked hypotheses + evidence | Analyze |

| Predictive Agent | Forecasting | TS + KG | Forecast + confidence intervals | Predict |

| Digital Twin Agent | Plume/evac sim | Sensor + geometry | Simulated fields | Simulate |

| Governance Agent | Guardrails | All agent outputs | Approve/redact/log | Meta-agent |

\### 10.2 Orchestration Pattern

\`\`\`mermaid

sequenceDiagram

participant K as Kafka

participant PA as Perception Agent

participant TA as Telemetry Agent

participant CRA as Compound Risk Agent

participant KG as Knowledge Graph

participant GA as Governance Agent

participant HITL as Human Supervisor

participant N as Notification Bus

K->>PA: cv.events.ppe.violation

K->>TA: ot.norm.LEL-4021

PA->>KG: upsert CVEvent + edges

TA->>KG: upsert Observation

KG-->>CRA: CDC trigger

CRA->>KG: pattern match Cypher

CRA->>CRA: score = f(severity, proximity, trend)

CRA->>GA: propose CompoundRisk (HIGH)

GA->>GA: policy check, PII redact, cite check

GA->>HITL: send for confirm (if HIGH)

HITL->>N: acknowledge → broadcast

GA->>KG: record decision + evidence

\`\`\`

\### 10.3 Agent Implementation

\- \*\*Framework:\*\* LangGraph (state-machine agents) atop \*\*Temporal\*\* for durable workflows.

\- \*\*LLM backends:\*\* vLLM-served Llama 3.1 70B (on-prem preferred), fallback to hosted APIs by tenant policy.

\- \*\*Tools per agent:\*\* typed function schemas (KG query, TS query, notify, draft artifact). No agent has an \`actuate\` tool — enforced by Governance Agent + capability tokens.

\### 10.4 Governance Agent — Capability Enforcement

\`\`\`yaml

capabilities:

\- id: query\_kg

scope: \[read\]

\- id: query\_ts

scope: \[read\]

\- id: notify\_human

scope: \[write:notification\]

\- id: draft\_document

scope: \[write:draft\]

\- id: actuate\_equipment

scope: \[forbidden\] # hard-wired denial

\- id: override\_sis

scope: \[forbidden\]

\`\`\`

\---

\## 11. Computer Vision Pipeline

\### 11.1 Pipeline Diagram

\`\`\`mermaid

flowchart LR

CAM\[RTSP Cameras\] --> DEC\[GStreamer/DeepStream  
H.264 Decode\]

DEC --> PRE\[Preprocess  
Resize/Normalize\]

PRE --> DET\[YOLOv8m PPE + RT-DETR Forklift  
TensorRT INT8\]

DET --> TRK\[ByteTrack  
Multi-Object Tracking\]

TRK --> ZONE\[Zone Geometry  
Homography → Plant Coords\]

ZONE --> ACT\[Action Rec:  
X3D Slip/Fall\]

ACT --> EVT\[Event Formatter\]

EVT --> RED\[PII Redaction  
Face Blur on non-violation\]

RED --> KAF\[Kafka: cv.events.\*\]

EVT --> LOC\[Local Buffer  
SQLite/Rocks\]

LOC -.store & forward.-> KAF

\`\`\`

\### 11.2 Detection Classes (V1)

| Class | Model | Notes |

|---|---|---|

| Hardhat | PPE-YOLO | Color-agnostic |

| Safety Vest | PPE-YOLO | Hi-vis ANSI 107 |

| Safety Glasses | PPE-YOLO | Difficult; needs pose gating |

| Gloves | PPE-YOLO | Hand keypoint gated |

| Face Shield | PPE-YOLO | Task-context (hot work) |

| Fall Arrest Harness | PPE-YOLO | Height-context |

| Person | YOLO | Anchor for co-occurrence |

| Forklift / MHE | RT-DETR | Vehicle taxonomy |

| Pedestrian-in-Lane | Composite | Person ∩ Vehicle-Lane polygon |

| Slip/Fall | X3D | Temporal window 32 frames |

| Fire | YOLO-NAS | 640×640 |

| Smoke | YOLO-NAS | 640×640 |

| Confined-Space-Entry | Composite | Person ∩ CS polygon + PTW check |

| Restricted Zone Breach | Composite | Person ∩ Zone polygon + role check |

\### 11.3 Edge Hardware Reference

| Component | Reference | Notes |

|---|---|---|

| Compute | NVIDIA Jetson AGX Orin 64GB | 275 TOPS, sufficient for 8×1080p @ 15 fps |

| OS | JetPack 6 (Ubuntu 22.04) | Long-term support |

| Runtime | DeepStream 7 + Triton Edge | Batched inference |

| Camera Interface | RTSP over LAN VLAN | Isolated |

| Storage | 1 TB NVMe local buffer | 72 h retention at event-only |

| Networking | Dual NIC + LTE failover | Store-and-forward |

| Security | TPM 2.0, Secure Boot, encrypted disk | Zero-trust posture |

\### 11.4 Privacy by Design

\- Face embeddings never stored; blurred at edge on non-violation frames.

\- Bounding-box crops for violations retained per jurisdictional retention class (T7, T30, T365).

\- Workers can request Article-15/Article-17 (GDPR) or DPDP-equivalent access/erasure via Auditor Portal.

\- Union-transparent camera map available to workers on the mobile app.

\---

\## 12. Digital Twin & Geospatial Intelligence

\### 12.1 Twin Composition

| Layer | Content | Source |

|---|---|---|

| CAD/BIM Geometry | Plant 2D/3D layout | IFC/DWG import |

| Zone Semantics | Hazardous area classification (Zone 0/1/2) | Native editor + import |

| Live State | Worker locations (UWB/RTLS), equipment status | Wearables + KG |

| Environmental | Wind, temperature, humidity | Local weather API + on-site sensors |

| Simulation | Plume, evacuation, blast radius | PINN surrogates + fallback CFD |

\### 12.2 Plume Simulation

\- \*\*Primary:\*\* Physics-Informed Neural Network (PINN) surrogate trained against FLACS/OpenFOAM offline runs. Latency < 3 s for 90-second plume projection.

\- \*\*Fallback:\*\* Gaussian plume for small releases; disclosed to user as "approximate."

\- \*\*Constraint:\*\* All plume outputs carry uncertainty bands; recommendations require ≥ 80% coverage of population at risk.

\### 12.3 Dynamic Evacuation Routing

\`\`\`mermaid

sequenceDiagram

participant ER as Emergency Response Agent

participant DT as Digital Twin

participant KG as Knowledge Graph

participant PLM as Plume Surrogate

participant N as Notifications

ER->>DT: request evac plan (trigger\_id)

DT->>PLM: simulate plume T+0..T+300s

DT->>KG: fetch worker locations, muster points

DT->>DT: route optimize (multi-source Dijkstra with plume cost)

DT-->>ER: routes\[\] + muster\_assignment\[\]

ER->>N: personalized mobile push + voice broadcast + PA

N-->>KG: delivery receipts

KG-->>ER: muster verification stream

\`\`\`

\### 12.4 Geospatial Heatmap

\- Rendered on Level-1/Level-2 HMI in ISA-101 grayscale with \*\*only\*\* deviation colors overlaid.

\- Layers toggleable: PPE compliance %, gas readings, forklift density, active permits, past-year incident hotspots, contractor density.

\- Time-slider for retrospective and up to +30 min forecast.

\---

\## 13. Workflow Engines: PTW, LOTO, Shift Handover, Incident

\### 13.1 Permit-to-Work (PTW) State Machine

\`\`\`mermaid

stateDiagram-v2

\[\*\] --> Draft

Draft --> RiskAssessed: JSA drafted (AI-assisted)

RiskAssessed --> ConflictCheck: submit

ConflictCheck --> RequiresChange: conflict detected

RequiresChange --> Draft

ConflictCheck --> Approved: no conflict + supervisor sign

Approved --> Active: crew NFC check-in

Active --> Suspended: compound risk elevated

Suspended --> Active: risk cleared + re-verify

Active --> Closed: work complete + area verify

Closed --> \[\*\]

Suspended --> Cancelled: cannot resolve

Cancelled --> \[\*\]

\`\`\`

\### 13.2 LOTO Verification Flow

| Step | Human | SafetyOS AI |

|---|---|---|

| Identify energy sources | Authorized employee | AI cross-checks equipment KG for known isolation points |

| Apply locks/tags | Human | AI verifies via CV (lock visible on isolation point) |

| Verify zero energy | Human | AI cross-checks OT (pressure/temp/current at zero for T seconds) |

| Perform work | Human | AI monitors zone for unauthorized reactivation |

| Remove locks | Authorized only | AI verifies sequence and same-person removal via NFC |

| Return to service | Supervisor | AI generates return-to-service checklist |

\### 13.3 Shift Handover AI

\- Ingests: outgoing operator log, open permits, active alarms, deferred maintenance, unresolved near-misses.

\- Outputs: structured handover packet (voice + text), quiz for incoming operator on top 3 hazards, sign-off with biometric.

\- \*\*Guarantee:\*\* No handover marked complete until every open compound risk is explicitly acknowledged.

\### 13.4 Incident Response (First-10-Minute Playbook)

\`\`\`mermaid

sequenceDiagram

participant Trigger

participant ER as Emergency Response Agent

participant Twin as Digital Twin

participant PA as PA System

participant Mob as Mobile App

participant Ext as External (Ambulance/Fire)

participant Reg as Regulator (IR-1)

Trigger->>ER: confirmed trigger (human or fused-AI + human)

par

ER->>Twin: evac plan

and

ER->>PA: broadcast (localized)

and

ER->>Mob: personalized route + muster

and

ER->>Ext: auto-dial + geo-share (if authorized)

and

ER->>Reg: draft IR-1 (Factories Act §88A / OSHA 8-hour)

end

Twin-->>ER: muster verification

ER->>ER: after-action bundle

\`\`\`

\---

\## 14. User Experience & Industrial HMI Design

\### 14.1 Design Principles (ISA-101 Aligned)

| Principle | Manifestation |

|---|---|

| Grayscale-first | UI base uses 5-step gray scale; color reserved |

| Semantic color | Red=Critical, Yellow=Warning, Blue=Action Required, Cyan=Info, White=Normal |

| Deviation-only emphasis | Normal state fades; deviations pop |

| Consistent iconography | ISO 7010 for safety signs |

| Minimal typography | Two type sizes on Level 1; 14–24pt |

| High contrast | WCAG 2.2 AA minimum, AAA where feasible |

| Large touch targets | ≥ 48×48 dp mobile; ≥ 64×64 dp glove-mode |

| Voice-first mobile | ≥ 80% of field flows achievable by voice |

| Explainability-first | Every alert has "Why?" one-tap |

| Offline-first | Full field workflows offline |

\### 14.2 Display Hierarchy

| Level | Audience | Refresh | Content |

|---|---|---|---|

| L1 | Plant-wide operator, Plant Head | 1 s | Site heatmap, SIF exposure index, top 3 open compound risks |

| L2 | Unit operator, Supervisor | 500 ms | Unit KPIs, PPE compliance %, permits active, alarms |

| L3 | Field engineer, HSE | 1 s | Equipment detail, LOTO status, permits, trends |

| L4 | RCA analyst, Auditor | Static + ad-hoc | Timelines, AI explanations, evidence bundle |

\### 14.3 Alarm Rationalization (ISA-18.2)

| Control | Target |

|---|---|

| Alarms per operator per hour | ≤ 6 (steady state) |

| Alarm flood threshold | > 10 in 10 min = "flood" mode |

| Suppression on flood | AI-clustered root-cause primary shown; secondaries stacked |

| Chattering suppression | Debounce ≥ 30 s; hysteresis dead-band |

| Stale alarms | Auto-lift after operator-set stale threshold + audit |

\### 14.4 Wireframe — Level-1 Command Console (ASCII)

\`\`\`

+-------------------------------------------------------------+

| SafetyOS | Site: VZP-STEEL | Shift: A | 09:14 IST |

+-------------------------------------------------------------+

| SIF EXPOSURE INDEX: 34 ↑ (yesterday 22) |

| OPEN COMPOUND RISKS: 2 | ACTIVE PERMITS: 47 |

+-------------------------------------------------------------+

| |

| \[ Plant Layout Heatmap (grayscale) \] |

| |

| COKE-B ● HIGH Hot Work + LEL trend |

| BOF-2 ○ MED Confined Space + Handover |

| |

+-------------------------------------------------------------+

| ALARMS (rationalized 47→3) |

| \[R\] LEL rising Zone-Coke-N \[Ack\] \[Why?\] \[SOP\] |

| \[Y\] Forklift proximity Aisle-3 \[Ack\] \[Why?\] |

| \[B\] Handover pending — Shift A→B \[Action\] |

+-------------------------------------------------------------+

\`\`\`

\### 14.5 Voice Interaction Grammar (Mobile)

| Utterance | Intent | Slot Fill |

|---|---|---|

| "Report hot work at weld bay four" | \`permit.draft\` | type=hot\_work, zone= |

| "Show me the SOP for confined space" | \`sop.lookup\` | topic=confined\_space |

| "Log near miss — dropped tool from platform" | \`nearmiss.report\` | category=falling\_object |

| "What's the gas reading in coke oven north?" | \`observation.query\` | tag=LEL/H2S, zone=<> |

| "Muster me" | \`evac.route.request\` | worker=self |

\---

\## 15. Mobile & Field Application

\### 15.1 Platform Choices

| Concern | Choice | Rationale |

|---|---|---|

| Framework | React Native + native modules for BLE/NFC | Cross-platform + native performance |

| Local DB | SQLite + CRDT (Automerge) | Offline-first, deterministic merge |

| Sync | Backend gRPC bi-di stream with resumable cursors | Field-network reality |

| Voice | On-device Whisper.cpp small-en + fallback cloud | Privacy + offline |

| Maps | Mapbox GL Native + custom plant layers | Offline tiles |

| Auth | Passkeys + PIN fallback + NFC badge | Glove-friendly |

\### 15.2 Offline Flow

\`\`\`mermaid

sequenceDiagram

participant M as Mobile

participant L as Local Store

participant Q as Local Queue

participant API as Cloud API

M->>L: read/write locally

M->>Q: enqueue mutations (CRDT deltas)

Note over M,Q: Network partition tolerated

M->>API: on reconnect → sync queue

API-->>M: server deltas

M->>L: merge (Automerge)

\`\`\`

\### 15.3 Contractor Onboarding

\- Multilingual (12 Indian languages + English, Spanish, Arabic).

\- Site-specific hazards presented as short video + quiz (pass ≥ 80%).

\- Portable \*\*Safety Passport\*\* signed by SafetyOS trust root; verifiable across sites.

\---

\## 16. Data Model & Database Schemas

\### 16.1 PostgreSQL Core (Workflow + Identity)

\`\`\`sql

CREATE TABLE workers (

worker\_id UUID PRIMARY KEY,

external\_id TEXT UNIQUE,

full\_name TEXT NOT NULL,

role TEXT NOT NULL,

org\_id UUID NOT NULL REFERENCES orgs(org\_id),

is\_contractor BOOLEAN NOT NULL DEFAULT FALSE,

passport\_id UUID REFERENCES safety\_passports(passport\_id),

created\_at TIMESTAMPTZ NOT NULL DEFAULT now(),

updated\_at TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TABLE certifications (

cert\_id UUID PRIMARY KEY,

worker\_id UUID NOT NULL REFERENCES workers(worker\_id),

cert\_type TEXT NOT NULL, -- 'CONFINED\_SPACE','HOT\_WORK','LOTO','H2S'

issued\_by TEXT NOT NULL,

valid\_from DATE NOT NULL,

valid\_until DATE NOT NULL,

evidence\_url TEXT,

CHECK (valid\_until >= valid\_from)

);

CREATE TABLE permits (

permit\_id UUID PRIMARY KEY,

site\_id UUID NOT NULL,

type TEXT NOT NULL, -- 'HOT\_WORK','CS','WORK\_AT\_HEIGHT'...

status TEXT NOT NULL, -- state machine

zone\_id UUID NOT NULL,

created\_by UUID NOT NULL REFERENCES workers(worker\_id),

approved\_by UUID REFERENCES workers(worker\_id),

valid\_from TIMESTAMPTZ NOT NULL,

valid\_until TIMESTAMPTZ NOT NULL,

jsa\_ref UUID,

compound\_risk\_flags JSONB DEFAULT '\[\]',

ai\_draft\_meta JSONB

);

CREATE INDEX idx\_permits\_active

ON permits (site\_id, zone\_id) WHERE status = 'ACTIVE';

CREATE TABLE loto\_orders (

loto\_id UUID PRIMARY KEY,

equipment\_id UUID NOT NULL,

applied\_by UUID NOT NULL,

verified\_by UUID,

points JSONB NOT NULL, -- list of isolation points

status TEXT NOT NULL,

applied\_at TIMESTAMPTZ NOT NULL,

cleared\_at TIMESTAMPTZ

);

CREATE TABLE incidents (

incident\_id UUID PRIMARY KEY,

site\_id UUID NOT NULL,

severity TEXT NOT NULL, -- 'SIF','LTI','MTC','FA','NM'

occurred\_at TIMESTAMPTZ NOT NULL,

reported\_at TIMESTAMPTZ NOT NULL,

narrative TEXT,

regulator\_case\_id TEXT,

evidence\_bundle\_url TEXT

);

\`\`\`

\### 16.2 TimescaleDB Hypertables

\`\`\`sql

CREATE TABLE observations (

ts TIMESTAMPTZ NOT NULL,

tag\_id UUID NOT NULL,

site\_id UUID NOT NULL,

value DOUBLE PRECISION,

quality SMALLINT, -- OPC-UA StatusCode

unit TEXT

);

SELECT create\_hypertable('observations','ts',chunk\_time\_interval => INTERVAL '1 day');

CREATE INDEX ON observations (tag\_id, ts DESC);

SELECT add\_compression\_policy('observations', INTERVAL '7 days');

SELECT add\_retention\_policy('observations', INTERVAL '2 years');

\`\`\`

\### 16.3 Vector Store (pgvector)

\`\`\`sql

CREATE TABLE doc\_chunks (

chunk\_id UUID PRIMARY KEY,

doc\_id UUID NOT NULL,

jurisdiction TEXT,

doc\_type TEXT, -- SOP, REG, MANUAL, INCIDENT

section\_ref TEXT,

content TEXT NOT NULL,

embedding VECTOR(1024) NOT NULL,

tokens INT,

updated\_at TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX ON doc\_chunks USING ivfflat (embedding vector\_cosine\_ops) WITH (lists=200);

\`\`\`

\### 16.4 Knowledge Graph (Neo4j) — Node Constraints

\`\`\`cypher

CREATE CONSTRAINT worker\_id IF NOT EXISTS FOR (w:Worker) REQUIRE w.id IS UNIQUE;

CREATE CONSTRAINT equipment\_id IF NOT EXISTS FOR (e:Equipment) REQUIRE e.id IS UNIQUE;

CREATE CONSTRAINT zone\_id IF NOT EXISTS FOR (z:Zone) REQUIRE z.id IS UNIQUE;

CREATE INDEX obs\_ts IF NOT EXISTS FOR (o:Observation) ON (o.ts);

\`\`\`

\### 16.5 Event Envelope (Kafka)

\`\`\`json

{

"event\_id": "evt\_01HXKQ...",

"event\_type": "cv.event.ppe.violation",

"schema\_version": "1.3.0",

"producer": {"gateway\_id":"edge-vzp-01","site\_id":"vzp"},

"ts\_produced": "2026-07-21T09:14:22.451Z",

"ts\_observed": "2026-07-21T09:14:22.301Z",

"payload": {

"camera\_id":"cam-coke-n-04",

"frame\_id":"frm\_...",

"class":"missing\_hardhat",

"confidence":0.94,

"bbox":\[412,220,540,398\],

"worker\_ref":null,

"zone\_id":"zn\_coke\_oven\_north"

},

"trace\_id": "01HXK...",

"sensitivity":"restricted"

}

\`\`\`

\---

\## 17. API Specification

\### 17.1 API Style

\- \*\*External (partner/integrator):\*\* REST + OpenAPI 3.1, gRPC for streaming, GraphQL for the console.

\- \*\*Internal:\*\* gRPC + Protobuf, event-driven via Kafka.

\- \*\*AuthN:\*\* OIDC (Keycloak/Entra) + mTLS at gateway.

\- \*\*AuthZ:\*\* OPA-backed RBAC + attribute-based (site, role, jurisdiction).

\- \*\*Versioning:\*\* URI prefix \`/v1\`, \`/v2\`; deprecation window ≥ 12 months.

\### 17.2 Illustrative REST Endpoints

\`\`\`yaml

openapi: 3.1.0

info:

title: SafetyOS Public API

version: 1.0.0

paths:

/v1/permits:

post:

summary: Draft a Permit-to-Work

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/PermitDraftRequest' }

responses:

'201':

description: Draft created with AI JSA

content:

application/json:

schema: { $ref: '#/components/schemas/Permit' }

/v1/permits/{permit\_id}/approve:

post:

responses:

'200': { description: Approved }

'409': { description: Conflict with active permit or compound risk }

/v1/compound-risks:

get:

parameters:

\- name: site\_id

in: query

required: true

\- name: severity\_min

in: query

schema: { type: string, enum: \[LOW, MED, HIGH\] }

responses:

'200':

description: List of open compound risks

content:

application/json:

schema:

type: array

items: { $ref: '#/components/schemas/CompoundRisk' }

/v1/observations:

get:

parameters:

\- name: tag\_id

in: query

required: true

\- name: from

in: query

schema: { type: string, format: date-time }

\- name: to

in: query

schema: { type: string, format: date-time }

responses:

'200':

content:

application/json:

schema:

type: array

items: { $ref: '#/components/schemas/Observation' }

/v1/copilot/ask:

post:

requestBody:

content:

application/json:

schema:

type: object

properties:

question: { type: string }

context:

type: object

properties:

site\_id: { type: string }

zone\_id: { type: string }

worker\_id: { type: string }

responses:

'200':

description: Grounded answer with citations

content:

application/json:

schema: { $ref: '#/components/schemas/CopilotAnswer' }

/v1/incidents/{incident\_id}/ir1:

get:

summary: Draft IR-1 (Factories Act §88A)

responses:

'200':

content:

application/pdf: {}

\`\`\`

\### 17.3 Example Request/Response

\*\*Draft PTW:\*\*

\`\`\`http

POST /v1/permits HTTP/1.1

Authorization: Bearer eyJ...

Content-Type: application/json

{

"type": "HOT\_WORK",

"zone\_id": "zn\_coke\_oven\_north",

"requested\_by": "wrk\_ravi\_01",

"planned\_start": "2026-07-21T10:00:00+05:30",

"planned\_end": "2026-07-21T12:00:00+05:30",

"description": "Cut flange on line L-204",

"crew": \["wrk\_ravi\_01","wrk\_priya\_02"\]

}

\`\`\`

\*\*Response (excerpted):\*\*

\`\`\`json

{

"permit\_id": "ptw\_01HXKR...",

"status": "DRAFT",

"ai\_draft\_meta": {

"jsa\_ref": "jsa\_...",

"hazards\_identified": \["hot\_work","adjacent\_flammable"\],

"conflicts\_detected": \[

{

"type":"COMPOUND\_RISK",

"pattern":"HOT\_WORK\_LEL\_ADJACENT",

"score":0.62,

"evidence":\[{"tag":"LEL-4022","value":6.1,"unit":"%LEL","ts":"..."}\]

}

\],

"citations":\[

{"id":"OSHA\_1910\_252(a)(2)(iv)"},

{"id":"OISD\_105\_5.3.2"},

{"id":"SOP-HW-14"}

\]

}

}

\`\`\`

\### 17.4 Streaming (gRPC)

\`\`\`proto

service EventStream {

rpc SubscribeCompoundRisks(SiteFilter) returns (stream CompoundRiskEvent);

rpc SubscribeObservations(TagFilter) returns (stream Observation);

rpc PublishFieldObservation(stream FieldObservation) returns (Ack);

}

\`\`\`

\### 17.5 Webhooks

| Event | Signature |

|---|---|

| \`compound\_risk.opened\` | HMAC-SHA256 with tenant secret |

| \`permit.suspended\` | HMAC-SHA256 |

| \`incident.confirmed\` | HMAC-SHA256 |

| \`evac.initiated\` | HMAC-SHA256 |

\---

\## 18. Security, Privacy & Compliance Architecture

\### 18.1 Threat Model (STRIDE Excerpt)

| Threat | Vector | Mitigation |

|---|---|---|

| Spoofing (fake edge node) | Rogue Jetson claims to be site device | mTLS + device attestation via TPM |

| Tampering (model backdoor) | Adversarial supply chain | SBOM + Sigstore signing + reproducible builds |

| Repudiation (deleted alarm) | Insider deletes evidence | Append-only audit log (WORM S3) + hash-chained |

| Information Disclosure (CCTV) | Data exfiltration | Face blur at edge + tenant-scoped keys (KMS/Vault) |

| Denial of Service (event flood) | Adversary floods Kafka | Per-tenant quotas + edge back-pressure |

| Elevation of Privilege | Console user escalates | OPA policy + JIT admin + short-lived tokens |

| \*\*OT-Specific:\*\* Southbound writes | Malicious agent tries to actuate | Capability system: \`actuate\_equipment\` forbidden; unidirectional gateway at L3.5 |

\### 18.2 Zero-Trust Posture

\`\`\`mermaid

flowchart LR

U\[User\] -->|OIDC + WebAuthn| GW\[API Gateway\]

GW -->|OPA policy| SVC\[Microservice\]

SVC -->|SPIFFE ID| SVC2\[Microservice\]

SVC -->|Vault dynamic creds| DB\[(DB)\]

EDGE\[Edge Node\] -->|mTLS + TPM attest| GW

subgraph "Everything is identified, signed, logged"

end

\`\`\`

\### 18.3 Data Classification & Retention

| Class | Examples | Retention | Storage |

|---|---|---|---|

| Public | Regulations, marketing | Indefinite | Any |

| Operational | Non-personal telemetry | 2 years hot, 7 years cold | Tenant-scoped |

| Restricted | PTW, LOTO, Incident | 7 years (regulatory) | Tenant-scoped, encrypted |

| Sensitive | Worker PII, biometrics | Jurisdictional min; default 90 d for CV bbox non-violation | Tenant-scoped, per-field encryption |

| SIF Evidence | Confirmed incident bundles | 10 years, WORM | Legal hold |

\### 18.4 Compliance Coverage

| Standard | How SafetyOS Meets It |

|---|---|

| ISO 27001 | ISMS, control set, annual audit |

| SOC 2 Type II | Security, availability, confidentiality |

| ISO 45001 | Native artifacts: hazard identification, participation, incident, audit |

| GDPR / DPDP | DPIA templates, data subject rights, DPO tooling |

| EU AI Act (High-Risk) | Risk mgmt, data governance, transparency, human oversight, logging |

| IEC 62443 (ICS security) | Zones/conduits, patching windows, hardening baselines |

| ISA-101 / ISA-18.2 | Native UX + alarm management |

\### 18.5 Audit Log Schema

\`\`\`json

{

"audit\_id":"aud\_01HXK...",

"actor":{"type":"user|agent|system","id":"..."},

"action":"permit.approve",

"target":{"type":"Permit","id":"ptw\_..."},

"before\_hash":"sha256:...",

"after\_hash":"sha256:...",

"prev\_audit\_hash":"sha256:...", // hash chain

"ts":"2026-07-21T09:14:22.451Z",

"reason":"supervisor override",

"signature":"ed25519:..."

}

\`\`\`

\---

\## 19. Reliability, Observability & SRE

\### 19.1 SLOs

| Service | Availability | Latency (p99) | Error Budget |

|---|---|---|---|

| API Gateway | 99.95% | 300 ms | 21.6 min/month |

| Compound Risk Engine | 99.9% | 3 s | 43.2 min/month |

| Copilot (RAG) | 99.5% | 4 s | 3.6 h/month |

| Edge CV | 99.9% (local) | 500 ms (edge-local) | — |

| KG queries | 99.9% | 500 ms (indexed) | 43.2 min/month |

| Notification delivery | 99.99% | 2 s | 4.3 min/month |

\### 19.2 Observability Stack

\- \*\*Metrics:\*\* Prometheus + Grafana (RED + USE panels per service).

\- \*\*Logs:\*\* OpenSearch with per-tenant indices.

\- \*\*Traces:\*\* OpenTelemetry → Tempo.

\- \*\*AI Observability:\*\* Langfuse for LLM calls; Evidently for CV/ML drift.

\- \*\*Business KPIs:\*\* Custom pipelines to Data Lake (Iceberg on S3).

\### 19.3 Chaos & Safety Drills

| Drill | Cadence | Success Criterion |

|---|---|---|

| Edge → Cloud partition (24 h) | Monthly | 0 CV events lost, catch-up < 30 min |

| KG primary failover | Quarterly | RPO ≤ 60 s, RTO ≤ 15 min |

| LLM provider outage | Monthly | On-prem fallback engaged automatically |

| Alarm flood simulation | Quarterly | Rationalization ratio ≥ 10:1 |

| Emergency Response tabletop | Quarterly | First broadcast ≤ 90 s |

\---

\## 20. Deployment Topology

\### 20.1 Reference Deployment (Enterprise Multi-Site)

\`\`\`mermaid

flowchart TB

subgraph SITE\_A\[Site A - Refinery\]

A\_CAM\[Cameras\] --> A\_EDGE\[Edge Cluster  
Jetson x N\]

A\_OT\[SCADA/PLC\] --> A\_OPC\[OPC-UA Aggregator\]

A\_EDGE --> A\_DDMZ\[IDMZ Gateway\]

A\_OPC --> A\_DDMZ

end

subgraph SITE\_B\[Site B - Steel\]

B\_CAM\[Cameras\] --> B\_EDGE\[Edge Cluster\]

B\_OT\[SCADA/PLC\] --> B\_OPC\[OPC-UA\]

B\_EDGE --> B\_DDMZ\[IDMZ Gateway\]

B\_OPC --> B\_DDMZ

end

A\_DDMZ --> CLOUD

B\_DDMZ --> CLOUD

subgraph CLOUD\[SafetyOS Regional Cloud\]

CL\_K\[Kafka\]

CL\_K8S\[Kubernetes: services + agents\]

CL\_KG\[(Neo4j Causal Cluster)\]

CL\_TS\[(TimescaleDB HA)\]

CL\_PG\[(PostgreSQL HA)\]

CL\_OBJ\[(Object Store)\]

CL\_LLM\[LLM Gateway  
vLLM + guardrails\]

end

CLOUD --> USERS\[Users: Web + Mobile\]

\`\`\`

\### 20.2 Deployment Options

| Model | Fit | Notes |

|---|---|---|

| SaaS multi-tenant | Mid-market | Fastest onboarding |

| Dedicated tenant | Enterprise | Single-tenant K8s namespace + KMS |

| Hybrid (Edge + Customer Cloud) | Regulated (energy, defense) | Sovereign LLM on-prem |

| Fully On-Prem | Air-gapped defense/nuclear | Manual model updates via signed bundles |

\### 20.3 Kubernetes Baseline

\- Control planes per region, with \*\*istio\*\* service mesh, \*\*cert-manager\*\*, \*\*external-secrets\*\* (Vault), \*\*Argo CD\*\* for GitOps, \*\*Kyverno\*\* for policy enforcement, \*\*KEDA\*\* for event-driven scaling.

\- \*\*Node pools:\*\* general (CPU), GPU (Triton/vLLM), memory-optimized (Neo4j), IO-optimized (Kafka/Timescale).

\---

\## 21. KPIs, OKRs & Acceptance Criteria

\### 21.1 Business KPIs

| KPI | Baseline | 12-mo Target | 24-mo Target |

|---|---|---|---|

| Deployed sites | 0 | 20 | 120 |

| Annual Recurring Revenue | $0 | $6 M | $40 M |

| SIF-precursor detections / site / quarter | — | ≥ 40 | ≥ 100 |

| Customer NPS (HSE Manager) | — | ≥ 50 | ≥ 65 |

| Median deployment time (Phase-1) | — | ≤ 14 days | ≤ 7 days |

\### 21.2 Product OKRs (H2 2026)

\*\*O1: Prove predictive superiority over single-sensor baselines.\*\*

\- KR1: 4.5× lift in compound-risk recall.

\- KR2: Median lead time ≥ 8 minutes.

\- KR3: FN ≤ 0.8% on labeled compound scenarios.

\*\*O2: Land 12 lighthouse deployments across steel, refining, chemicals.\*\*

\- KR1: 12 signed customers.

\- KR2: 100% deploy in ≤ 14 days.

\- KR3: 3 customer-published case studies.

\*\*O3: Achieve auditability sufficient for EU AI Act high-risk certification.\*\*

\- KR1: 100% recommendations carry \`ExplanationBundle\`.

\- KR2: External auditor pre-assessment: no critical findings.

\### 21.3 Feature Acceptance Criteria (Sample)

\*\*F-101: PPE Detection\*\*

\- ✅ Recall ≥ 99.2% on internal test set (n ≥ 20k frames per class).

\- ✅ Precision ≥ 92%.

\- ✅ Latency p99 ≤ 250 ms at edge.

\- ✅ Bias parity across skin tones and helmet colors within ±2%.

\- ✅ Privacy: faces blurred on ≥ 99.9% of non-violation frames.

\*\*F-207: Compound Risk (Hot-Work + LEL)\*\*

\- ✅ Correctly opens \`CompoundRisk\` node within 3 s of second-signal arrival.

\- ✅ Cites at minimum: 1 CV/observation, 1 permit, 1 regulation, 1 SOP.

\- ✅ Suspends related permit on operator ack within 500 ms.

\- ✅ False positives ≤ 1 per site per week during shadow mode.

\---

\## 22. Risk Register

| ID | Risk | Likelihood | Impact | Score | Mitigation | Owner |

|---|---|---|---|---|---|---|

| R-01 | AI mis-recommendation causes wrong action | Low | Catastrophic | 12 | Human-in-loop; capability tokens forbid actuation; explainability | Chief Safety Officer |

| R-02 | OT integration destabilizes DCS | Very Low | Catastrophic | 10 | Read-only; unidirectional gateway; certified integration protocol | OT/SCADA Lead |

| R-03 | Model drift in new site lighting | High | Medium | 12 | Shadow mode 7 days; per-site fine-tune; drift monitors | ML Lead |

| R-04 | Union pushback on CCTV analytics | Medium | High | 9 | Face blur at edge; union-transparent camera map; opt-in scope | Legal + HR |

| R-05 | LLM hallucination in copilot | Medium | High | 9 | RAG with grounded citation gate; refusal on non-cited claims | Applied AI Lead |

| R-06 | Regulatory reclassification (AI Act) | Medium | High | 9 | Governance Agent; documentation kit; DPIA templates | Compliance Lead |

| R-07 | Data breach of CCTV corpus | Low | Catastrophic | 10 | Edge-first, tenant KMS, encrypted storage, SOC 2 controls | CISO |

| R-08 | Sales cycle >12 months | Medium | Medium | 6 | "Trojan Horse" edge-only entry | GTM Lead |

| R-09 | Alarm rationalization over-suppresses | Low | High | 6 | Human override always; per-alarm audit trail | UX + SRE |

| R-10 | Vendor lock-in on LLM | Medium | Medium | 6 | On-prem Llama fallback; provider abstraction | CTO |

Score = Likelihood (1-5) × Impact (1-5).

\---

\## 23. Roadmap & Release Plan

\### 23.1 Phased Roadmap

\`\`\`mermaid

gantt

dateFormat YYYY-MM

title SafetyOS 24-Month Roadmap

section Phase 1 - Trojan Horse

Edge CV (PPE/Forklift/Slip) :done, p1a, 2026-01, 3M

Grayscale Dashboard (L1/L2) :done, p1b, 2026-02, 3M

Incident Reporting v1 :active, p1c, 2026-04, 2M

section Phase 2 - Workflow

PTW / LOTO Digitization : p2a, 2026-06, 4M

RAG Copilot v1 : p2b, 2026-07, 4M

Contractor Passport : p2c, 2026-09, 3M

section Phase 3 - Fusion

OPC-UA Ingest : p3a, 2026-10, 3M

Compound Risk Engine v1 : p3b, 2026-11, 4M

Alarm Rationalization : p3c, 2027-01, 3M

section Phase 4 - Predictive & Twin

Predictive Analytics (PHM) : p4a, 2027-03, 4M

Digital Twin + Plume : p4b, 2027-05, 5M

Emergency Orchestrator v2 : p4c, 2027-07, 3M

section Phase 5 - Platform

Insurance Data Oracle : p5a, 2027-09, 4M

Robotics Data Marketplace : p5b, 2027-11, 4M

\`\`\`

\### 23.2 Feature Prioritization (RICE)

| Feature | Reach | Impact | Confidence | Effort | RICE |

|---|---|---|---|---|---|

| PPE Detection (Edge) | 10 | 3 | 90% | 3 | 9.0 |

| Compound Risk (Hot-Work+LEL) | 8 | 3 | 80% | 5 | 3.84 |

| Digital PTW + JSA | 9 | 3 | 85% | 5 | 4.59 |

| LOTO Verification | 7 | 3 | 75% | 4 | 3.94 |

| Forklift Proximity | 8 | 3 | 90% | 3 | 7.20 |

| RAG Copilot | 10 | 2 | 80% | 4 | 4.00 |

| Emergency Orchestrator | 6 | 3 | 70% | 6 | 2.10 |

| Shift Handover AI | 9 | 2 | 80% | 3 | 4.80 |

| Contractor Passport | 6 | 2 | 70% | 4 | 2.10 |

| Digital Twin Plume | 5 | 3 | 60% | 8 | 1.13 |

| Insurance Oracle | 3 | 3 | 50% | 6 | 0.75 |

\### 23.3 Release Vehicle

\- \*\*Trunk-based\*\* development, feature flags via LaunchDarkly.

\- \*\*Two-track release:\*\* cloud services shipped weekly; edge models shipped monthly with signed bundles + canary.

\---

\## 24. Go-to-Market & Business Model

\### 24.1 Pricing

| Tier | Target | Pricing | Includes |

|---|---|---|---|

| SafetyOS Lite | Mid-market manufacturing | $2,000/site/month + $10/camera/month | Edge CV (PPE, forklift, slip), Dashboard, Incident |

| SafetyOS Pro | Large enterprise | Custom, $150k–$400k/site/year | + PTW/LOTO + Copilot + OT integration |

| SafetyOS Enterprise | Global multi-site | Multi-year TCV | + Digital Twin + Predictive + Passport + Insurance Oracle |

| Public Sector / Air-Gap | Defense, sovereign | On-prem license + support | Full stack on-prem |

\### 24.2 Commercial Moats

\- \*\*Data network effects:\*\* Each new site enriches compound-risk pattern library (privacy-preserving federated learning).

\- \*\*Regulatory moat:\*\* OISD/DGMS/OSHA-mapped SOP-to-regulation graph is 12+ engineer-years of curation.

\- \*\*Switching cost:\*\* Once the KG is populated, migration cost is prohibitive.

\### 24.3 Long-Term Platform Bets

| Bet | Rationale | Time Horizon |

|---|---|---|

| Insurance Data Oracle | Underwriters value real-time exposure; premium delta pays for platform | Year 3 |

| Portable Safety Passport | Industry-standard identity for contractors | Year 3-4 |

| Robotics Training Marketplace | Synthesized hazard datasets for humanoid safety training | Year 4-5 |

| Regulator Co-Pilot | White-label to DGMS/OSHA for supervisory AI | Year 4-5 |

\---

\## 25. Appendices

\### 25.1 Appendix A — Illustrative Compound-Risk Patterns (Seed Library)

| Pattern ID | Description | Signals | Severity |

|---|---|---|---|

| CR-HW-LEL-ADJ | Hot work permit + LEL rise in adjacent zone | PTW, LEL trend | HIGH |

| CR-CS-STARTUP | Confined space entry during unit startup transient | PTW, DCS mode | HIGH |

| CR-LOTO-CMD | LOTO removed on equipment + control command detected | LOTO status, OT | CRITICAL |

| CR-FL-PED-SHIFT | Forklift + pedestrian in aisle during shift change | CV, roster | HIGH |

| CR-GD-CALIB | Confined-space entry with overdue gas-detector calibration | PTW, CMMS | HIGH |

| CR-HANDOVER-OPEN | Shift handover incomplete with open critical alarm | Handover state, alarms | MED |

| CR-WEATHER-HW | Hot work outdoors + high wind + adjacent flammable inventory | PTW, weather, tank inventory | HIGH |

| CR-LONE-CONFINED | Lone worker + confined space + comms loss | Wearable, PTW | CRITICAL |

| CR-HEAT-EXERT | High WBGT + heavy exertion (wearable HR/motion) | Weather, wearable | HIGH |

| CR-FIRE-EGRESS | Fire/smoke event + egress route obstruction (CV) | CV, plant map | CRITICAL |

\### 25.2 Appendix B — Regulatory Citation Coverage (V1)

| Corpus | Docs | Chunks (est.) | Jurisdiction |

|---|---|---|---|

| OSHA 1910/1926 | 1,600 | 42,000 | US |

| OISD 105/106/116/117/155/… | 84 | 12,500 | India O&G |

| DGMS Circulars (2000–2026) | 1,200 | 18,000 | India mining |

| Factories Act + State Rules | 340 | 9,000 | India |

| ISO 45001, ISO 14001 | 30 | 2,000 | Global |

| IEC 61511 / 61508 / 62443 | 24 | 4,500 | Global |

| Client SOPs (per site) | Variable | 5k–50k | Site-specific |

\### 25.3 Appendix C — Decision Matrix: Graph Store

| Criterion | Weight | Neo4j | JanusGraph | Amazon Neptune | AGE (PG) |

|---|---|---|---|---|---|

| Cypher maturity | 20 | 5 | 3 | 4 | 3 |

| Enterprise support | 15 | 5 | 2 | 5 | 2 |

| Ops complexity | 15 | 4 | 2 | 4 | 4 |

| Multi-tenant story | 10 | 4 | 3 | 3 | 4 |

| ACID | 10 | 5 | 4 | 5 | 5 |

| Cost | 10 | 3 | 4 | 3 | 5 |

| Ecosystem | 10 | 5 | 3 | 4 | 3 |

| On-prem support | 10 | 5 | 5 | 1 | 5 |

| \*\*Score\*\* | | \*\*4.5\*\* | \*\*3.0\*\* | \*\*3.7\*\* | \*\*3.6\*\* |

\### 25.4 Appendix D — Tradeoff: Edge vs. Cloud Inference

| Dimension | Edge (Jetson) | Cloud (Triton) | Decision |

|---|---|---|---|

| Latency | 90–250 ms | 300–1000 ms | Edge for safety-critical |

| Cost per stream | Higher upfront capex | Lower opex per stream | Edge for high-traffic sites |

| Privacy | Native (blur at source) | Requires egress | Edge |

| Model updates | Signed bundle + canary | Instant | Cloud |

| Scale of model | ≤ ~500 M params | Any (70B+) | RAG/copilot in cloud |

| \*\*Rule\*\* | Perception ⇒ Edge | Reasoning/RAG/Forecast ⇒ Cloud | Hybrid mandatory |

\### 25.5 Appendix E — Sample Event Timeline (Visakhapatnam-like Scenario, Prevented)

| T-Offset | Signal | System Action |

|---|---|---|

| −18 min | LEL Zone-North rising trend (2%→4%) | Observation logged; Predictive Agent forecasts 7% in 15 min (CI 0.83) |

| −14 min | Hot-work permit submitted, adjacent zone | Permit Agent detects proximity; draft flagged |

| −13 min | Compound Risk Agent creates CR-HW-LEL-ADJ (score 0.71) | HIGH — HITL notification to supervisor |

| −12 min | Supervisor acknowledges, suspends permit; requests gas team recalibration | Suspension audited |

| −8 min | Gas team confirms flange leak; isolates | Observation quality "GOOD"; leak logged |

| 0 min | Would-be ignition avoided | Incident.NearMiss.confirmed |

\### 25.6 Appendix F — Sample \`ExplanationBundle\` Rendering (UI)

\`\`\`

COMPOUND RISK — HIGH ●

Hot Work + Rising LEL (Adjacent)

Evidence

• CV: cam-coke-n-04, person + welding-arc (94%)

• Obs: LEL-4022 = 8.4%LEL @ 09:14:22

• Permit: PTW-2026-07-21-0817 (HOT WORK, Zone Coke-N)

Reasoning

Pattern HOT\_WORK\_LEL\_ADJACENT@v2.1

Citations

• OSHA 1910.252(a)(2)(iv) — "hot work near flammable"

• OISD-105 §5.3.2 — "gas testing prerequisites"

• SOP-HW-14 v3.2 §4 — "suspend on LEL > 5%"

Recommended Actions (SafetyOS DOES NOT execute)

\[ \] Suspend Permit PTW-…-0817 \[Apply\]

\[ \] Notify crew for muster \[Apply\]

\[ \] Dispatch gas test team \[Apply\]

Counterfactual

If LEL had stayed < 3%, recommendation would be MONITOR only.

\`\`\`

\### 25.7 Appendix G — Sample Regulatory Draft (IR-1 Excerpt)

\> \*\*Incident Report (Preliminary) — SafetyOS-generated draft\*\*

\> Site: VZP-STEEL, Coke Battery 3

\> Date/Time (IST): 2026-07-21 09:14

\> Nature: Near-miss (compound risk prevented)

\> Signals observed: LEL trend, hot-work permit, camera detection

\> Actions taken: Permit PTW-…-0817 suspended by Shift Supervisor at 09:15

\> Regulatory refs: Factories Act §88A applicability: negative (no injury); OISD-105 §5.3.2 procedural compliance verified.

\> Attachments: Evidence bundle EV-01HXK…

\> Prepared by: SafetyOS Emergency Response Agent (v2.1) — Human-review required prior to submission.

\### 25.8 Appendix H — Sample Kafka Topics

| Topic | Key | Partitions | Retention |

|---|---|---|---|

| \`ot.raw..\` | tag\_id | 24 | 7 d |

| \`ot.norm.\` | tag\_id | 24 | 30 d |

| \`cv.events.\` | camera\_id | 12 | 30 d |

| \`permits.events\` | permit\_id | 6 | 365 d |

| \`compound\_risk.events\` | risk\_id | 6 | 365 d |

| \`notifications.out\` | user\_id | 12 | 30 d |

| \`audit.events\` | audit\_id | 6 | 3650 d (WORM sink) |

\### 25.9 Appendix I — Non-Functional Requirements Summary

| NFR | Target |

|---|---|

| Availability (multi-tenant cloud) | 99.95% |

| Availability (edge, per-site) | 99.9% |

| Peak concurrent users per site | 500 |

| Peak CV streams per edge node | 8 @ 1080p 15 fps |

| Peak OT tags per site | 100,000 |

| Data ingest peak | 200k events/s per region |

| RPO / RTO | 60 s / 15 min |

| Localization | 12 Indian + 8 international languages |

| Accessibility | WCAG 2.2 AA |

\### 25.10 Appendix J — Sample Feature Flags

| Flag | Default | Purpose |

|---|---|---|

| \`copilot.autonomous\_permit\_suspend\` | OFF (forever) | Never auto-suspend without human ack |

| \`cv.face\_blur\_non\_violation\` | ON | Privacy default |

| \`agent.actuate\_equipment\` | OFF (hard-wired) | Immutable guard |

| \`alarm.rationalization.aggressive\` | OFF | Conservative default |

| \`plume.simulator.pinn\` | ON | Fall back to Gaussian if surrogate fails |

\---

\## 26. Glossary

| Term | Definition |

|---|---|

| \*\*CRDT\*\* | Conflict-free Replicated Data Type; supports offline merges without central coordinator |

| \*\*DCS\*\* | Distributed Control System; typically vendor systems from ABB/Emerson/Yokogawa/Honeywell |

| \*\*DGMS\*\* | Directorate General of Mines Safety (India) |

| \*\*DGFASLI\*\* | Directorate General Factory Advice Service & Labour Institutes (India) |

| \*\*DPIA\*\* | Data Protection Impact Assessment |

| \*\*HMI\*\* | Human-Machine Interface |

| \*\*IDMZ\*\* | Industrial DMZ; segregated network zone between OT and IT (L3.5 in Purdue) |

| \*\*ISA-101\*\* | Standard for HMI design in process industries |

| \*\*ISA-18.2\*\* | Standard for alarm management in the process industries |

| \*\*JSA\*\* | Job Safety Analysis |

| \*\*KG\*\* | Knowledge Graph |

| \*\*LEL\*\* | Lower Explosive Limit (concentration of gas at which combustion is possible) |

| \*\*LOTO\*\* | Lockout/Tagout — energy isolation procedure |

| \*\*OPC-UA\*\* | Open Platform Communications — Unified Architecture |

| \*\*OISD\*\* | Oil Industry Safety Directorate (India) |

| \*\*OT\*\* | Operational Technology |

| \*\*PHM\*\* | Prognostics and Health Management |

| \*\*PINN\*\* | Physics-Informed Neural Network |

| \*\*PTW\*\* | Permit-to-Work |

| \*\*RAG\*\* | Retrieval-Augmented Generation |

| \*\*RCA\*\* | Root Cause Analysis |

| \*\*RUL\*\* | Remaining Useful Life |

| \*\*SCADA\*\* | Supervisory Control and Data Acquisition |

| \*\*SIF\*\* | Serious Injury and Fatality |

| \*\*SIS\*\* | Safety Instrumented System (per IEC 61511) |

| \*\*SOP\*\* | Standard Operating Procedure |

| \*\*STT\*\* | Speech-to-Text |

| \*\*WORM\*\* | Write-Once-Read-Many storage |

\---

\*\*— End of Document —\*\*

\*This PRSD is a living specification. Section owners are responsible for keeping their sections in lockstep with the running implementation. All deviations must be documented in the change log with rationale, tradeoffs, and safety impact assessment countersigned by the Chief Safety Officer and CISO.\*