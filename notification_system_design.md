# Stage 1 — Notification System REST API Design

## Overview

The Campus Notifications Microservice is designed to provide real-time notifications to students regarding:

- Placements
- Events
- Results

The system supports:
- Fetching notifications
- Fetching unread notifications
- Creating notifications
- Marking notifications as read
- Real-time notification delivery

---

# Base URL

```http
http://localhost:5000/api