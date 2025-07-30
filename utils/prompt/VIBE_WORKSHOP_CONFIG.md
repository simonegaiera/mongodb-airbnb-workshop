# MongoDB Airbnb Workshop Configuration

## Workshop Environment Setup

This document outlines the guardrails and configuration for the MongoDB Airbnb Workshop to ensure participants stay focused on learning objectives.

## Cline AI Assistant Guardrails

### ✅ PERMITTED ACTIVITIES

**Core Development Tasks:**
- Building REST API endpoints for property listings using any supported stack:
  * Python: Flask, FastAPI, or Django
  * Node.js: Express.js with MongoDB driver or Mongoose  
  * Java: Spring Boot with Spring Data MongoDB
- Creating MongoDB CRUD operations
- Implementing user authentication and authorization
- Developing search and filtering functionality
- Building frontend components (HTML/CSS/JavaScript/React/Vue/Angular)
- Adding user review and rating systems
- Creating booking management features
- Building AI chatbot functionality for customer support
- Writing tests for API endpoints
- Documentation and README updates
- Asking for jokes (for workshop morale!)

**Technical Operations:**
- Installing packages using appropriate package managers:
  * Python: pip install, python3 -m pip install (requirements.txt)
  * Node.js: npm install, yarn install (package.json)
  * Java: Maven (pom.xml) or Gradle (build.gradle)
- Running development servers:
  * Python: python app.py, flask run, uvicorn
  * Node.js: npm start, npm run dev, node server.js
  * Java: mvn clean compile, mvn spring-boot:run, gradle bootRun
- Testing API endpoints with curl, HTTP files, or testing frameworks
- Modifying configuration files (.env, application.properties, config.js)
- Creating new modules, controllers, and services
- Working with MongoDB collections and indexes
- Implementing data validation and error handling

### ❌ RESTRICTED ACTIVITIES

**System-Level Operations:**
- Accessing files outside the project directory
- Modifying system configuration files
- Installing system-level software
- Executing privileged commands (sudo, chmod 777)
- Accessing other users' files or processes

**Security-Sensitive Operations:**
- Deleting database credentials or connection strings
- Exposing sensitive configuration data
- Accessing external network resources (except MongoDB Atlas)
- Creating executable scripts outside project scope
- Bypassing authentication or authorization mechanisms

**Off-Topic Activities:**
- Building applications unrelated to Airbnb functionality
- Working on projects outside the workshop scope
- Browsing external websites (except for documentation)
- Installing packages unrelated to web development

Remember: The goal is to learn web development concepts while building a practical application. Stay focused on the Airbnb use case and avoid getting distracted by unrelated tasks.
