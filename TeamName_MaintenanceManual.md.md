# NorthStar Maintenance Manual
## Introduction
The NorthStar system is a job-matching website that comprises multiple components, including a Web Scraper, Resume Parser, AI chatbot, Trend Analysis, and Job Search/Matcher. This manual offers comprehensive instructions for performing maintenance, troubleshooting issues, and long-term performance and stability.

## System Requirements
### _Hardware Requirements_
__Frontend Server:__ 2 vCPUs, 2GB RAM, 20GB storage

__Backend Server:__ Python (Flask/FastAPI), required libraries from requirements.txt

__Database:__ PostgreSQL instance with 2 vCPUs, 4GB RAM, 50GB storage

__Network:__ Reliable internet connection with >10 Mbps bandwidth
### _Software Requirements_
__Frontend:__ React, Node.js

__Backend :__ 2 vCPUs, 4GB RAM, 40GB storage

__Database:__ PostgreSQL instance with 2 vCPUs, 4GB RAM, 50GB storage

__Hosting:__ Reliable internet connection with >10 Mbps bandwidth    

__Source Control:__ GitHub

### _Configuration_
* GitHub repository with environment variable files (.env)
* Automated backup scripts configured on the database server
* Access control using role-based privileges for developers and admins






## Maintenance Procedures 
### _System Updates_
1. Pull the latest codes updates from Github.
2. Update the requirement.txt and run pip install -r requirements.txt to ensure all aditional libraries are present.
3. Deploy updates to render hosting.
4. Verify deployment by checking logs and testing updated functions.
### _Database Backups_
1. Ensure backup scripts are running.
2. Store backup in a secure location.
3. Test backup recovery monthly by restoring to a staging database.
### _Security Audits_
1. Run scans to test for vulnerabilities on backend and frontend components. 
2. check server logs for any suspescuious logins and activities. 
3. Rotate access keys and passwords every 3 months.
4. Patch any issues **As Soon As Possible.**
### _Performance Reviews_
1. Monitor systems for errors and slow responses.  
2. Analyze API repsonse and frontend load speeds.
3. Apply optimaztion to queries, caching, or fronted components.
4. Document performance changes in the maintenance log.

### _Documentation Updates_
1. Update user manual for any changes.
2. Stores in Github under /docs/.

## Troubleshooting Guide
|# Issue | Possible Cause | Solution|
| --- | --- | --- |
| System Downtime   | Render service outage, deployment error  | Restart services on Render, roll back last deployment if necessary  |
| Database Connection Failure  | Wrong credentials, network issue, PostgreSQL crash   | Check .env config, restart PostgreSQL, verify network   |
| Web Scraper Failure  | Website structure changed, dependency error   | Update scraping logic in Python code, re-install dependencies   |
| AI Chatbot Not Responding | API key expired, server overload   | Renew API key, scale backend resources   |
| Slow Performance   | Inefficient queries, high traffic   | Optimize queries, enable caching, increase server capacity   |




## Security & Backup Procedures

### _Data Protections_
* Use HTTPS for all connections
* Encrypt sensitive data in transit and at rest
* Restrict admin access using role-based permissions

### Backup & Recovery
1. Perform daily automated backups of the PostgreSQL database.
2. Store at least one weekly backup in an offsite location.
3. Test recovery monthly by restoring to a staging database.
4. In case of corruption, restore from the most recent stable backup.

## Change Management Process
1. __Request for Change (RFC):__ Submit a request via GitHub Issues or project management tool.
2. __Documentation:__ Team lead (Jacob Ulloa) reviews and approves the change.
3. __Implementation:__ Assigned engineer makes the change in a feature branch.
4. __Testing:__ QA Tester (Vikas Bommisetty) verifies the change in a staging environment.
5. __Deployment:__ Approved changes are merged into the main branch and deployed to production.
6. __Documentation:__ Update relevant manuals, logs, and user documentation.

## Appendices 
