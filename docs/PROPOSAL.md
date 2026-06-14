# PROJECT PROPOSAL

**PROJECT TITLE:** Unified Multi-Branch Inventory, POS, and Sales Management System  
**CLIENT:** RJO Industrial Products  
**TARGET BRANCHES:** Cebu, Bacolod, and Dumaguete  
**ESTIMATED TIMELINE:** 5 to 6 Months (Initial Deployment)  
**TECHNOLOGY STACK:** Node.js, Express, TypeORM, MySQL, React (Vite), and Tailwind CSS  

---

## 1. Executive Summary

RJO Industrial Products currently operates through manual and branch-isolated processes for inventory monitoring, supplier coordination, quotation handling, and counter sales. This proposal recommends the implementation of a unified, cloud-based business platform that will centralize operations across Cebu, Bacolod, and Dumaguete.

The recommended delivery approach is modular. This allows RJO to begin with a practical operational baseline under **Package A**, stabilize day-to-day workflows, and then expand into more advanced control, reporting, and automation capabilities through **Package B** or **Package C** without replacing the original system or re-entering existing data.

The objective is to provide management with stronger visibility, improve branch-level execution, reduce manual reconciliation, and create a scalable foundation for future growth.

---

## 2. Proposed Solution Overview

The full solution vision covers four major business areas:

### 2.1 Governance and User Access
- Role-based access controls to protect sensitive operational and financial data
- Central administration of users, permissions, and branch visibility
- Structured approval flow for sensitive actions such as deactivation, pricing exceptions, or stock movements

### 2.2 Inventory, Supplier, and Logistics Operations
- Real-time stock visibility across all branches
- Supplier profile management and purchase order tracking
- Receiving workflows for inbound deliveries
- Inter-branch stock movement controls
- Low-stock alerting for replenishment planning

### 2.3 Sales, POS, and Billing
- Fast retail and wholesale POS processing
- Quotation creation and conversion to sale
- Cash and account-based charge transaction handling
- Invoice and receipt generation

### 2.4 Customer and Credit Management
- Structured customer profiling
- Retail versus wholesale pricing alignment
- Outstanding balance monitoring
- Accounts receivable tracking and credit control policies

> **Important Scope Note:** The solution vision above describes the full target platform. The exact features included in the initial implementation depend on the package selected in Section 5.

---

## 3. Role Definitions

To ensure clarity in both implementation and commercial scope, the following role definitions apply throughout this proposal:

- **SuperAdmin**
  Overall system owner with access to all branches, pricing configurations, dashboards, permissions, and executive reporting.

- **Admin**
  Central operational administrator responsible for maintaining users, suppliers, customers, products, and approval workflows.

- **Branch Manager**
  Branch-level operator responsible for local inventory oversight, receiving, purchase requests, transfer requests, and branch sales supervision.

- **Cashier / Encoder**
  Frontline user restricted to approved POS transactions, quotation preparation, customer updates, and permitted branch-level data entry.

---

## 4. Delivery Timeline and Milestones

The proposed 5 to 6-month delivery window is intended to support system build-out, phased validation, user acceptance testing, and onboarding across the three target branches.

### Months 1-2: Foundation and Core Setup
- Database design and application architecture
- Branch configuration
- User roles and permission structure
- Base product catalog and supplier profiles
- Core inventory data model

### Months 3-4: Sales and Operational Workflows
- POS workflow implementation
- Customer profiling
- Quotation workflow
- Branch stock movement structure
- Initial reporting outputs

### Month 5: Controls, Reporting, and Operational Refinement
- Management dashboards
- Export-ready reports
- Enhanced operational validation
- Package-based feature refinement depending on selected scope

### Month 6: Quality Assurance, UAT, and Onboarding
- System-wide QA and stabilization
- User acceptance testing
- Guided onboarding for branch users
- Support for initial data preparation and migration

---

## 5. Package Options and Scope Alignment

To support a practical rollout, RJO may begin with **Package A: Core Operations** in Year 1, then upgrade later to **Package B** or **Package C** as operational maturity and reporting requirements expand.

> **Introductory Incentive:** Package A includes a **10% discount on the first-year software development fee** and **6 months of post-deployment maintenance support at no additional cost**.

### 5.1 Package Summary

#### Package A: Core Operations
Designed for initial implementation and operational stabilization.

Included scope:
- Multi-branch branch visibility for Cebu, Bacolod, and Dumaguete
- Core user management using essential role groupings
- Product catalog and supplier profile registry
- Basic quotation preparation and printing
- Stock in/out monitoring
- Basic inventory visibility
- Basic procurement support through supplier directory and stock intake logging
- Cash POS transactions
- Basic customer profiling
- Daily operational summary reporting

Not included in Package A:
- Full RBAC audit trails
- Supplier purchase order workflows
- 30-day charge sales
- AR aging ledger
- Automated overdue credit blocking
- Inter-branch transfer workflow automation

#### Package B: Standard Operations Upgrade
Designed for stronger operational control and more complete sales and procurement workflows.

Includes everything in Package A, plus:
- Full role-based access control
- Full quotation workflow with customer tier alignment
- Supplier purchase order management
- Formal procurement workflow with purchase orders and structured receiving
- Low-stock threshold alerts
- Retail and wholesale pricing alignment by customer type
- 30-day charge sales tracking
- PDF/Excel financial and inventory exports

#### Package C: Enterprise Premium Upgrade
Designed for executive-level visibility, stronger financial control, and branch-to-branch logistics management.

Includes everything in Package B, plus:
- System activity logs
- Inter-branch stock transfer workflows
- Accounts receivable aging ledger
- Automated overdue credit controls
- Detailed customer purchase history analytics
- Advanced procurement controls with receiving discrepancy tracking and stronger approval visibility
- Real-time executive dashboards

### 5.2 Feature Matrix

| Feature / Scope | Package A: Core Operations | Package B: Standard | Package C: Enterprise Premium |
| :--- | :--- | :--- | :--- |
| **Multi-Branch Coverage** | Included (3 branches) | Included (3 branches) | Included (3 branches) |
| **User Access Model** | Essential role grouping | Full RBAC | Full RBAC + activity logs |
| **Quotation Workflow** | Basic quotation preparation and printing | Full quotation workflow with customer tier alignment | Full quotation workflow + management visibility |
| **Inventory Management** | Stock in/out + on-hand visibility | Inventory + low-stock alerts | Full inventory + transfer workflows |
| **Procurement Workflow** | Supplier directory + basic stock intake logging | Supplier directory + purchase orders + structured receiving | Full procurement workflow + discrepancy controls + audit visibility |
| **POS Transactions** | Cash only | Cash + charge sales tracking | Cash + charge + overdue credit controls |
| **Customer Management** | Basic customer profiles | Customer tiers and pricing alignment | Customer tiers + purchase history analytics |
| **Reporting** | Daily summary logs | PDF/Excel exports | Dashboards + AR visibility |
| **Standard Package Cost** | ~~₱450,000.00~~ | ₱650,000.00 | ₱850,000.00 |
| **Discounted First-Year Cost** | **₱405,000.00** | — | — |
| **Upgrade Fee from Package A** | Base selection | **+ ₱245,000.00** | **+ ₱445,000.00** |

---

## 6. Payment Terms for Initial Package A Implementation

The initial implementation under Package A is proposed under the discounted first-year rate of **₱405,000.00**.

### Milestone Billing Structure
- **30% Downpayment:** ₱121,500.00  
  Upon project approval and mobilization

- **30% Milestone 1:** ₱121,500.00  
  Upon delivery of core setup, user roles, and base inventory/supplier structure

- **30% Milestone 2:** ₱121,500.00  
  Upon delivery of POS, customer profiling, and initial operational workflows

- **10% Retention:** ₱40,500.00  
  Upon deployment completion and final user acceptance sign-off

---

## 7. Maintenance and Support

Following deployment, the platform transitions into a maintenance and support phase intended to preserve reliability, data integrity, and operational continuity.

### 7.1 Package A Maintenance
- **Standard Maintenance Fee:** **₱15,000.00 per month**
- **Introductory Incentive:** Waived for the first 6 months of live operation

### 7.2 Included Maintenance Services
- Infrastructure and performance monitoring
- Automated data backup support
- Security updates for relevant framework dependencies
- Bug remediation and technical troubleshooting during standard support hours

### 7.3 Upgrade-Level Maintenance
- **Package B:** ₱18,000.00 per month
- **Package C:** ₱20,000.00 per month

---

## 8. Budget Projection

The following projection is intended to provide commercial visibility for the initial rollout and future upgrade options.

> **Infrastructure Cost Assumption:** Third-party operational expenses such as domain registration and hosting are billed separately from software development fees. For planning purposes, hosting and central database infrastructure are estimated at approximately **₱7,500.00 per month**, within an expected operating range of **₱5,000.00 to ₱10,000.00 per month**, depending on final usage and deployment architecture.

### 8.1 Financial Projection Table

| Cost Component | Year 1: Package A | Year 2: Upgrade to Package B | Year 2: Upgrade to Package C |
| :--- | :--- | :--- | :--- |
| **Software Development Cost** | ₱405,000.00 | — | — |
| **Upgrade Fee** | — | ₱245,000.00 | ₱445,000.00 |
| **Annual Domain Registration** | ~₱1,500.00 | ~₱1,500.00 | ~₱1,500.00 |
| **Hosting and Central Database** | ~₱90,000.00 / year | ~₱90,000.00 / year | ~₱90,000.00 / year |
| **Maintenance Support** | ₱0.00 for first 6 months | ₱216,000.00 / year | ₱240,000.00 / year |

### 8.2 Total Budget Outlook

#### Year 1: Package A Initial Deployment
- **Estimated Total Year 1 Budget:** **₱496,500.00**
- Includes:
  - ₱405,000.00 discounted development fee
  - ~₱1,500.00 annual domain
  - ~₱90,000.00 hosting and central database for 12 months
  - ₱0.00 maintenance for the first 6 live months

#### Year 2: Continue on Package A
- **Estimated Total Year 2 Budget:** **₱271,500.00**
- Includes:
  - ~₱1,500.00 annual domain
  - ~₱90,000.00 hosting
  - ₱180,000.00 standard maintenance

#### Year 2: Upgrade to Package B
- **Estimated Total Year 2 Budget:** **₱552,500.00**
- Includes:
  - ₱245,000.00 upgrade fee
  - ~₱1,500.00 annual domain
  - ~₱90,000.00 hosting
  - ₱216,000.00 adjusted maintenance

#### Year 2: Upgrade to Package C
- **Estimated Total Year 2 Budget:** **₱776,500.00**
- Includes:
  - ₱445,000.00 upgrade fee
  - ~₱1,500.00 annual domain
  - ~₱90,000.00 hosting
  - ₱240,000.00 adjusted maintenance

---

## 9. Assumptions and Exclusions

The commercial proposal above is based on the following assumptions:

### 9.1 Assumptions
- Deployment is intended for the three identified branches only: Cebu, Bacolod, and Dumaguete.
- RJO will assign project decision-makers for approvals, clarifications, and UAT coordination.
- Existing operational data to be migrated will be made available in usable digital format, or will require a separate cleanup effort if heavily manual.
- Stable branch internet connectivity will be available for day-to-day cloud access.
- Standard desktop or laptop workstations will be provided by the client for operational use.

### 9.2 Exclusions
- Third-party hardware such as POS printers, barcode scanners, receipt printers, routers, or dedicated server appliances
- Third-party SaaS subscriptions not explicitly listed in this proposal
- Large-scale historical data encoding beyond agreed onboarding support
- Custom integrations with external accounting, ERP, banking, or government systems unless separately scoped
- Mobile app development unless separately proposed
- On-site support outside agreed implementation and onboarding activities

---

## 10. Closing Note

This proposal is designed to help RJO Industrial Products move from manual branch operations toward a more disciplined, scalable, and management-visible digital workflow.

By beginning with a right-sized initial implementation and preserving a clear upgrade path, RJO can control investment risk while still laying down the architecture needed for future growth, stronger internal controls, and better cross-branch decision-making.

We would be pleased to refine this proposal further based on RJO’s preferred package, reporting priorities, and rollout expectations.
