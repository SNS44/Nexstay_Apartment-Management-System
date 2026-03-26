# NEXSTAY APARTMENT MANAGEMENT SYSTEM

## A MINI PROJECT REPORT
Submitted by
**P1** \
**P2** \
**P3** \
**P4** \

to the APJ Abdul Kalam Technological University in partial fulfilment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science

**Department of Computer Science Engineering** \
**College of Engineering** \
**Trikaripur** \
**APRIL 2025**

---

## DECLARATION
We undersigned hereby declare that the project report *"NexStay Apartment Management System"*, submitted for partial fulfillment of the requirements for the award of degree of Bachelor of Technology of the APJ Abdul Kalam Technological University, Kerala is a bonafide work done by us under the supervision of **[Guide Name]**, Assistant Professor, Department of CS. This submission represents our ideas in our own words and where ideas or words of others have been included, we have adequately and accurately cited and referenced the original sources. We also declare that we have adhered to ethics of academic honesty and integrity and have not misrepresented or fabricated any data or idea or fact or source in our submission. We understand that any violation of the above will be a cause for disciplinary action by the institute and/or the University and can also evoke penal action from the sources which have thus not been properly cited or from whom proper permission has not been obtained. This report has not been previously formed the basis for the award of any degree, diploma or similar title of any other University.

Place: \
Date:  \
Signature:

---

## CERTIFICATE
This is to certify that the report entitled **"NEXSTAY APARTMENT MANAGEMENT SYSTEM"**, submitted by **P1, P2, P3, P4** to the APJ Abdul Kalam Technological University in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science is a bonafide record of the project carried out by them under my guidance and supervision. This report in any form has not been submitted to any other University or Institute for any purpose.

**Internal Supervisor(s)** \
[Guide Name]

**External Supervisor(s)**

**PG Coordinator** 

**Head of the Department**

---

## ACKNOWLEDGEMENT
We give honour and praise to the Almighty who gave us wisdom and enabled us to complete this mini project successfully.
We would like to thank the Department of Computer Science Engineering, College of Engineering Trikaripur, for giving us the opportunity to present this project.
We would like to express our deep gratitude to our Head of Department and PG Co-ordinator for their timely suggestions and encouragement through the processes involved in the presentation of the project for their wholehearted support and encouragement for the betterment of the project and report preparation.
Last, but not the least, we express our heartfelt thanks to our friends and parents for their support and encouragement during this endeavour.

---

## VISION AND MISSION

### VISION (Institution)
To be a premier institution in education and research for moulding technically competent and socially committed professionals.

### MISSION (Institution)
*   Promote interdisciplinary research and innovation so as to meet the current needs of industry and society.
*   Attract, nurture and retain the best faculty and technical man power.
*   Provide state of art facilities for quality technical education.
*   Develop personality and professional skills of the students through interaction with alumni academia and industry.

### VISION (Department)
To mould technically competent and socially committed professionals in the field of computer science.

### MISSION (Department)
*   To provide a strong foundation in theoretical and practical aspects of computer science
*   To impart technical skills necessary to generate quality professional according to industry needs
*   To develop human resource with the ability to apply the knowledge for the benefit of the society

---

## ABSTRACT
In the modern urbanization era, residential complexes and apartments are growing in size and complexity, demanding efficient and reliable management systems. NexStay is a comprehensive web-based Apartment Management System specifically designed to streamline the administration and daily operations of modern residential communities. It provides an integrated digital platform mapping out floor plans, monitoring room statuses, managing user bookings, and accepting payments seamlessly.

NexStay features a highly secure authentication system and robust role-based dashboards utilizing React, Vite, and an interactive glassmorphism UI styled with Tailwind CSS. On the server side, it leverages PHP for stable API endpoints and MySQL for resilient data storage handling room bookings, financial payments, and user activity auditing. The core modules include digital rent and utility bill payments, booking verifications, priority-based service request ticketing, and an exhaustive activity log tracking system. 

By replacing conventional manual record-keeping with an interconnected digital environment, NexStay significantly reduces the administrative burden on property managers and vastly enhances transparency. This project advances real estate administration by offering a unified, visually premium, and user-centric application that guarantees improved operational efficiency for modern apartments.

---

## CONTENTS
1. ABSTRACT
2. LIST OF FIGURES
3. ABBREVIATIONS
4. CHAPTER 1: INTRODUCTION
5. CHAPTER 2: SRS
6. CHAPTER 3: MATERIAL AND METHODS
7. CHAPTER 4: IMPLEMENTATION
8. CHAPTER 5: RESULTS AND DISCUSSIONS
9. CHAPTER 6: CONCLUSION
10. BIBLIOGRAPHY

## LIST OF FIGURES
*   3.1 Data Flow Diagram
*   3.2 Activity Diagram
*   3.3 Use case Diagram
*   3.4 Database Design
*   4.1 Home Page
*   4.2 Resident Dashboard
*   4.3 Admin Dashboard
*   4.4 Payment Interface

---

## CHAPTER 1: INTRODUCTION

### 1.1 BACKGROUND
Managing an apartment complex involves numerous administrative and operational tasks, including resident management, flat and room assignments, rent collection, and maintenance scheduling. Traditionally, these processes have been handled manually using ledgers, paper notices, and basic spreadsheet software. This conventional approach is not only time-consuming but also prone to human error, missed maintenance requests, and payment discrepancies. 

With the rapid advancement in digital technologies, there is a growing need for automated systems capable of tracking room occupancies and maintaining an audit log for financial transactions and service requests. NexStay addresses these challenges through a unified web-based platform. It centralizes apartment floor-plans and room bookings, facilitating organized interactions between the management committee and residents.

### 1.2 SCOPE
The scope of NexStay extends comprehensively to administrative staff (admins) and apartment residents (users). For users, the system offers a hassle-free experience to browse available rooms across multiple floors, make monthly duration bookings, submit service requests with given priorities (Normal, High, Urgent), and manage fee payments. For administrators, it provides a centralized dashboard to track room occupancy (Available, Booked, Occupied, Maintenance), approve or reject booking requests, monitor the payment gateway statuses, and review system-wide user activity logs to prevent fraud. 

### 1.3 OBJECTIVE
The primary objective of the NexStay Apartment Management System is to modernize and automate the lifecycle of apartment rentals. Specific objectives include:
*   To develop an interconnected database capable of associating floors, rooms, residents, and financial transactions dynamically.
*   To enforce a stringent booking and approval workflow verified by the admin layer.
*   To implement a transparent ticketing architecture allowing users to submit detailed service requests linked to their specific rooms.
*   To secure financial operations with a comprehensive digital payment and verification system recorded in a tamper-resistant booking audit log.
*   To deploy a state-of-the-art UI offering premium visual aesthetics utilizing a glassmorphism design for optimal resident engagement.

### 1.4 PROPOSED SYSTEM
The proposed NexStay system utilizes a secure backend architecture via well-defined PHP API endpoints functioning independently from the React-driven frontend. Users register and receive a unique profile tailored to their resident status. They interact with dynamic interfaces to request room bookings, prompting admin authorization. Upon approval, their status shifts to resident, granting access to the payment gateway and service request modules. The system records all critical user actions (e.g., booking approvals, payments, status modifications) producing a transparent activity trace, drastically reducing the scope for operational disputes.

---

## CHAPTER 2: SRS

### 2.1 PRODUCT OVERVIEW
NexStay is a high-performance web application constructed to govern residential allocations efficiently. It operates primarily as a centralized management engine bridging apartment owners/admins and current/prospective tenants. The application accepts structured queries including room reservations, real-time payment submissions, and service ticketing. It processes these through a PHP logic layer and executes mutations within a normalized MySQL database, subsequently generating updated dashboards, invoices, and service itineraries.

### 2.2 PRODUCT FUNCTIONALITY
**User: Administrator** 
The Administrator functions as the ultimate authority within NexStay. Administrative functionalities include:
*   Creating, modifying, and tracking the status of Floors and distinct Rooms (Available, Occupied, Maintenance).
*   Reviewing pending resident "Bookings" and determining an Approve/Reject status.
*   Monitoring the comprehensive "Payments" ledger to perform transaction verifications against gateway responses.
*   Addressing incoming "Service Requests", assigning work tasks, and marking jobs as Completed. 
*   Observing comprehensive "Booking Audit Logs" and "User Activity" trackers for security and auditing purposes.

**User: Resident (User)**
A resident interacts with the localized features of the platform tailored to their tenancy. Their functionalities include:
*   Navigating the available rooms and submitting a Booking Request defining duration and move-in dates.
*   Executing payments securely via the integrated platform (supporting varied methods like UPI or standard transfers) for their monthly dues.
*   Raising categorized Service/Maintenance Requests with precise urgency definitions (Normal, High, Urgent).
*   Reviewing their personal dashboard for payment histories and actionable booking statuses.

### 2.3 DESIGN AND IMPLEMENTATION CONSTRAINTS
*   **Security Constraints:** Critical user actions require strict tokenized authentication processes via PHP sessions. Actions modifying financial data must be tracked by an immutable Audit Log.
*   **Frontend Constraints:** The user interface relies heavily on modern CSS modules (Tailwind, Framer Motion); thus, the client browser must support recent HTML5/CSS3 specifications to render the glassmorphism UI correctly.
*   **Database Normalization:** Strict relational integrity must be maintained. To prevent orphaned records, foreign key constraints (`ON DELETE CASCADE`, `ON DELETE SET NULL`) are rigidly enforced across interdependent tables like `bookings`, `payments`, and `rooms`.

### 2.4 HARDWARE REQUIREMENTS
*   **Server-Side:** Minimum 2 GHz dual-core CPU, 2GB RAM, 20GB Storage capable of running Apache/Nginx.
*   **Client-Side:** Standard personal computer or mobile device with a minimum of 4GB RAM to smoothly render complex UI motion architectures.
*   **Display:** Optimized for resolutions of 1280x720 and above.

### 2.5 SOFTWARE REQUIREMENTS
*   **Frontend Technologies:** HTML5, CSS3, JavaScript (ES6), React.js (^18.2.0), Vite framework, Tailwind CSS (^3.4.1), Lucide React (for uniform iconography), and Framer Motion (^12.0.0) for micro-interactions.
*   **Backend Technologies:** PHP 8.x for API development and endpoint orchestration.
*   **Database Management:** MySQL Server / MariaDB providing cross-relational mapping.
*   **Operating System:** Cross-platform (Windows/Linux/macOS) due to web-based nature.

### 2.6 FUNCTIONAL REQUIREMENTS
**USER MODULE:**
*   **Register & Login:** Users must register on the platform and securely log in to access the apartment management system and their personalized dashboard.
*   **Booking Management:** Users can seamlessly browse available rooms across multiple floors, submit a move-in booking request for a specific duration, and track the approval status of their requests.
*   **Payment Gateway Interface:** Users can view their pending monthly rent or maintenance dues, initiate secure digital transactions, and review their complete payment history.
*   **Service Request System:** Residents can generate categorized maintenance or service complaints related directly to their occupied room, assign an urgency level (Normal, High, Urgent), and track the resolution progress.

**ADMIN MODULE:**
*   **Facility Management:** Administrators can dynamically add new floors or rooms to the system, update room details, and manage occupancy statuses (Available, Booked, Occupied, Maintenance).
*   **Tenant Authorizations:** Administrators can review all incoming room booking requests from users and have the authority to process, approve, or reject them.
*   **Financial Oversight:** Administrators can verify digital payments accurately retrieved from external gateways, monitor total revenue collected, and manage tenant transactions.
*   **Audit Tool:** Administrators have access to comprehensive system-wide summaries, granular user activity traces, and secure booking audit logs to prevent fraud and ensure operational transparency.

---

## CHAPTER 3: MATERIAL AND METHODS

### 3.1 DESIGN PHASE
The design paradigm of NexStay adheres strictly to separating the visual presentation layer from the data management layer. By utilizing React/Vite, the UI is broken into reusable components (like cards and modals). Simultaneously, the database undergoes rigorous Entity-Relationship mapping ensuring minimal data redundancy across its distinct 8 tables (`users`, `floors`, `rooms`, `bookings`, `payments`, `service_requests`, `user_activity`, `booking_audit_log`). 

### 3.2 DATA FLOW DIAGRAM
The Data Flow Diagram (DFD) maps the trajectory of transactional requests. It isolates user inputs (e.g., a booking request including expected duration and monthly cost), passing through the PHP verification logic layer, inserting a 'Pending' index in the `bookings` table, which subsequently triggers an alert routed to the Administrator's interface for approval.

*(Note: Insert DFD Figure Here - Display the logical flow from `user` pushing requests (rooms, payments, service) into the PHP API Layer, storing into MySQL, and retrieving back via Admin API calls)*

### 3.3 ACTIVITY DIAGRAM
Activity pathways dictate the user journey. The primary activity stream models the rental timeline: 1. User logs in > 2. Views standard UI layout > 3. Filters available room statuses > 4. Submits move-in request > 5. Waits for system generated Admin status modification > 6. Status transits to 'Approved' > 7. User proceeds to Execute Payment.

*(Note: Insert Activity Diagram Figure Here)*

### 3.4 USE CASE DIAGRAM
The Use Cases segregate the interactions by Actor permission. Standard Users utilize `Register`, `Submit Booking`, `Make Payment`, and `Raise Service Ticket`. Administrative Actors utilize `Approve/Cancel Booking`, `Manage Floor/Room Schemas`, `Verify Payments`, and `Review Audit Logs`.

*(Note: Insert Use Case Diagram Figure Here)*

### 3.5 DATABASE DESIGN
The internal structure leverages InnoDB for high reliability. The architecture is deeply interdependent: 
*   The `rooms` table inherits IDs from `floors`. 
*   The `bookings` table fuses foreign keys from both `users` and `rooms`. 
*   The `payments` and `service_requests` tables demand active bindings to specific `user_id`s and `room_id`s. 
*   The `booking_audit_log` records exact schema shifts tracking `action_by`, `old_status`, and `new_status`.

*(Note: Insert ER Diagram / Database schema Figure Here)*

---

## CHAPTER 4: IMPLEMENTATION
The implementation phase synthesizes code logic and UI mapping into a deployable entity. 

**Frontend Construction:** Bootstrapped via Vite, the frontend is sculpted with React logic injecting `useState` and `useEffect` hooks for dynamic page rendering. Tailwind CSS was meticulously structured in `tailwind.config.js` to support the custom glassmorphism aesthetic—utilizing transparent backgrounds, background-blur filters, and gradient borders to render visual depth. `framer-motion` animates transitions between page states flawlessly.

**Backend Construction:** The endpoints are coded independently as modular PHP structures to ensure scalability and ease of maintenance. They utilize secure database connection strings with comprehensive `try-catch` blocks protecting queries. Stringent authentication protocols enforce session checks before granting access or returning any sensitive payload responses.

**Database Deployment:** Formulated natively using MySQL. Constraints guarantee database scaling while restricting anomalous actions, such as `ON DELETE CASCADE` which immediately resolves abandoned service requests if a particular room or user is removed from instances.

*(Note: Insert Screenshots Here: Home Page displaying Framer Motion features, Resident Dashboard showing Bookings, Admin Dashboard executing Payment Verifications)*

---

## CHAPTER 5: RESULTS AND DISCUSSIONS
The synthesis of advanced frontend libraries overlapping a structured PHP backend succeeded in providing a high-fidelity Apartment Management environment.

**Performance & Logic Verification:** Stress tests validating the transactional logic proved that overlapping room bookings were effectively prevented by the `status` checks inherent within PHP endpoints. The booking workflow seamlessly transposed users from an unassigned state into active 'Resident' states exclusively via Administrative approvals.

**Financial Integration:** The payment verification pipeline effectively secured the financial ledger. Administrators successfully utilized the centralized payment overview to cross-reference digital transactions generated by residents, proving the system highly robust against phantom inputs and unauthorized manipulations. 

**UI Responsiveness and User Experience:** Testing confirmed the Tailwind-based layout maintained its structural and aesthetic integrity across mobile, tablet, and desktop viewports. The glassmorphism design approach was overwhelmingly effective in modernizing the user interaction space, abandoning the traditional drab database-driven visual styles common in administrative software.

---

## CHAPTER 6: CONCLUSION
The NexStay Apartment Management System represents a significant structural advancement in multi-tenant administration. By systematically dissolving the reliance on disjointed manual processes and incorporating a highly secure, relational database model handled dynamically through PHP logic, it mitigates potential errors in bookkeeping and maintenance.

The implementation successfully delivered a specialized architecture granting specialized, robust command paths for administrators to oversee room occupancy, accept payments, and monitor strict audit logs, while empowering residents to intuitively manage their tenancy securely. Going forward, NexStay's scalable modular code base paves a solid foundation for further integrations including automated email alerts, IoT facility locks, and advanced predictive maintenance arrays.

---

## BIBLIOGRAPHY

**WEBSITES**
*   Vitejs documentation: https://vitejs.dev/
*   Tailwind CSS framework documentation: https://tailwindcss.com/
*   Framer Motion API Reference: https://www.framer.com/motion/
*   PHP Documentation Group. Manual: https://www.php.net/manual/en/
*   MySQL 8.0 Reference Manual: https://dev.mysql.com/doc/refman/8.0/en/
*   Reactjs documentation: https://react.dev/

**BOOKS**
*   Ian Sommerville, "Software Engineering", Tenth Edition, Pearson, 2015.
*   Elmasri, R. and Navathe, S. B., "Fundamentals of Database Systems", Seventh Edition, Pearson.
