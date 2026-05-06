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
```

---

# Authentication

All APIs are protected using Bearer Token Authentication.

## Example Header

```http
Authorization: Bearer <token>
```

---

# 1. Get All Notifications

## Endpoint

```http
GET /notifications
```

## Headers

```json
{
  "Authorization": "Bearer <token>"
}
```

## Response

```json
{
  "notifications": [
    {
      "id": "1",
      "type": "Placement",
      "message": "Amazon hiring for SDE",
      "isRead": false,
      "createdAt": "2026-04-22T17:50:30Z"
    }
  ]
}
```

---

# 2. Get Unread Notifications

## Endpoint

```http
GET /notifications/unread
```

## Response

```json
{
  "notifications": [
    {
      "id": "2",
      "type": "Result",
      "message": "Mid sem results published",
      "isRead": false,
      "createdAt": "2026-04-22T17:50:30Z"
    }
  ]
}
```

---

# 3. Create Notification

## Endpoint

```http
POST /notifications
```

## Request Body

```json
{
  "studentId": 1042,
  "type": "Placement",
  "message": "Microsoft hiring drive announced"
}
```

## Response

```json
{
  "message": "Notification created successfully"
}
```

---

# 4. Mark Notification as Read

## Endpoint

```http
PATCH /notifications/:id/read
```

## Response

```json
{
  "message": "Notification marked as read"
}
```

---

# 5. Delete Notification

## Endpoint

```http
DELETE /notifications/:id
```

## Response

```json
{
  "message": "Notification deleted successfully"
}
```

---

# Notification Types

Supported notification types:

- Placement
- Result
- Event

---

# Real-Time Notification Mechanism

The system uses WebSockets (Socket.IO) for real-time notification delivery.

## Workflow

1. Client connects using WebSocket
2. Server maintains persistent connection
3. When new notification arrives:
   - Notification stored in DB
   - Event emitted to connected client
4. Client instantly receives notification without page refresh

---

# Error Response Format

```json
{
  "error": true,
  "message": "Unauthorized access"
}
```

---

# HTTP Status Codes

| Status Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Resource Not Found |
| 500 | Internal Server Error |

---

# Naming Conventions

- RESTful API naming conventions used
- JSON response structure is consistent
- Proper HTTP methods used for each operation

---

# Stage 2 — Database Design and Storage Strategy

## Recommended Database

For the Campus Notifications Microservice, PostgreSQL is recommended as the primary database.

---

# Why PostgreSQL?

PostgreSQL is suitable because:

- Strong support for structured relational data
- Efficient indexing capabilities
- ACID compliance for reliable transactions
- Excellent support for filtering and sorting
- Scales well for notification systems
- Supports JSON fields if flexibility is required later

---

# Database Schema

## Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    student_id INT NOT NULL,
    notification_type VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Indexing Strategy

To improve query performance:

```sql
CREATE INDEX idx_student_notifications
ON notifications(student_id);

CREATE INDEX idx_student_read
ON notifications(student_id, is_read);

CREATE INDEX idx_notification_type
ON notifications(notification_type);

CREATE INDEX idx_created_at
ON notifications(created_at DESC);
```

---

# Problems as Data Volume Increases

As the number of students and notifications increases, several issues may arise:

- Slow query execution
- Increased DB load
- Full table scans
- High memory usage
- Slower sorting operations
- Increased API response times

---

# Solutions to Scaling Problems

## 1. Proper Indexing

Indexes reduce full table scans and improve filtering performance.

---

## 2. Pagination

Instead of loading all notifications:

```http
GET /notifications?page=1&limit=20
```

This reduces response size and DB load.

---

## 3. Archiving Old Notifications

Older notifications can be moved to archive tables or cold storage.

---

## 4. Database Partitioning

Notifications table can be partitioned based on:

- Date
- Student ID

This improves query efficiency.

---

## 5. Caching

Frequently accessed notifications can be cached using Redis.

---

# SQL Queries Based on REST APIs

## Fetch All Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = 1042
ORDER BY created_at DESC;
```

---

## Fetch Unread Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE
ORDER BY created_at DESC;
```

---

## Create Notification

```sql
INSERT INTO notifications (
    id,
    student_id,
    notification_type,
    message
)
VALUES (
    gen_random_uuid(),
    1042,
    'Placement',
    'Amazon hiring drive announced'
);
```

---

## Mark Notification as Read

```sql
UPDATE notifications
SET is_read = TRUE
WHERE id = 'notification-id';
```

---

## Delete Notification

```sql
DELETE FROM notifications
WHERE id = 'notification-id';
```

# Stage 3 — Query Optimization Analysis

## Problem Statement

The following query is becoming slow as the number of notifications increases:

```sql
SELECT *
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE
ORDER BY created_at DESC;
```

---

# Why the Query Becomes Slow

As the notifications table grows to millions of rows, the database faces several performance challenges:

- Full table scans
- Large sorting operations
- Increased disk I/O
- Higher memory consumption
- Longer response times

Without proper indexing, the database checks many rows before finding matching results.

---

# Root Cause Analysis

The query filters using:

- `student_id`
- `is_read`

and sorts using:

- `created_at DESC`

If indexes are missing, the database cannot efficiently locate relevant rows.

---

# Optimized Solution

A composite index can significantly improve performance.

## Recommended Composite Index

```sql
CREATE INDEX idx_notifications_query
ON notifications(student_id, is_read, created_at DESC);
```

---

# Why Composite Index Helps

This index helps because:

- `student_id` filtering becomes faster
- `is_read` filtering becomes faster
- `ORDER BY created_at DESC` becomes optimized
- Database avoids unnecessary sorting

---

# Performance Improvement

## Before Optimization

```text
Time Complexity ≈ O(n)
```

The database may scan most rows.

---

## After Optimization

```text
Time Complexity ≈ O(log n)
```

The database can directly access indexed records.

---

# Additional Optimization Techniques

## 1. Pagination

```http
GET /notifications?page=1&limit=20
```

Reduces result size and improves response speed.

---

## 2. Redis Caching

Frequently accessed notifications can be cached in Redis.

Benefits:
- Faster reads
- Reduced database load
- Lower latency

---

## 3. Read Replicas

Read-heavy workloads can be distributed across replica databases.

Benefits:
- Improved scalability
- Reduced pressure on primary DB

---

# Query for Students Receiving Placement Notifications

## Requirement

Find all students who received placement notifications in the last 7 days.

## Optimized Query

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

---

# Additional Recommended Index

```sql
CREATE INDEX idx_placement_notifications
ON notifications(notification_type, created_at);
```

# Stage 4 — Performance Improvement Strategies

## Overview

As the number of students and notifications grows, the notification system must scale efficiently while maintaining low response times and high availability.

Several optimization strategies can be implemented to improve overall system performance.

---

# 1. Redis Caching

## Description

Redis can be used to cache frequently accessed notifications in memory.

Instead of querying the database repeatedly, notifications can be served directly from cache.

---

## Advantages

- Faster API responses
- Reduced database load
- Lower latency
- Improved scalability

---

## Disadvantages

- Additional infrastructure required
- Cache invalidation complexity
- Extra memory usage

---

# 2. Pagination

## Description

Pagination limits the number of notifications returned per request.

Example:

```http
GET /notifications?page=1&limit=20
```

---

## Advantages

- Smaller response size
- Reduced memory usage
- Faster query execution
- Better frontend performance

---

## Disadvantages

- Multiple API requests required
- Added pagination logic

---

# 3. Lazy Loading

## Description

Notifications are loaded only when required by the user.

Example:
- Initial page loads latest 20 notifications
- Older notifications load on scroll

---

## Advantages

- Reduced initial load time
- Better user experience
- Lower bandwidth usage

---

## Disadvantages

- Slightly more frontend complexity

---

# 4. Infinite Scrolling

## Description

Notifications load continuously as the user scrolls.

---

## Advantages

- Smooth user experience
- Efficient content loading

---

## Disadvantages

- Harder navigation for very old notifications
- Potential memory issues if poorly implemented

---

# 5. WebSockets for Real-Time Delivery

## Description

WebSockets maintain persistent communication between client and server.

Notifications are pushed instantly to users without refreshing the page.

---

## Advantages

- Real-time communication
- Low latency
- Better user engagement

---

## Disadvantages

- Persistent connection management
- Higher server resource usage

---

# 6. Background Workers and Queues

## Description

Heavy notification processing tasks can be moved to background workers.

Queue systems:
- RabbitMQ
- Kafka
- BullMQ

---

## Advantages

- Better scalability
- Asynchronous processing
- Improved reliability

---

## Disadvantages

- More infrastructure complexity
- Queue monitoring required

---

# 7. Read Replicas

## Description

Read-heavy workloads can be distributed across multiple database replicas.

---

## Advantages

- Improved read scalability
- Reduced load on primary database

---

## Disadvantages

- Replication lag
- Increased infrastructure cost

---

# Recommended Combined Architecture

The best scalable architecture would combine:

- PostgreSQL as primary DB
- Redis for caching
- WebSockets for real-time updates
- Queue workers for asynchronous processing
- Pagination for efficient APIs
- Read replicas for scaling reads

---

# Stage 5 — Scalable Notification Delivery Design

## Existing Pseudocode Problem

The provided pseudocode processes notifications sequentially:

```javascript
for student in students:
    save_to_database(student)
    send_email(student)
    send_push_notification(student)
```

This approach works for small numbers of users but becomes inefficient at scale.

---

# Problems in Existing Approach

## 1. Sequential Processing

Each notification waits for the previous one to complete.

This increases total execution time significantly.

---

## 2. Poor Scalability

For thousands of students:

- High response times
- Delayed notification delivery
- Increased server load

---

## 3. Single Point of Failure

If one operation fails:
- Remaining notifications may not process
- Entire workflow may stop

---

## 4. No Retry Mechanism

Temporary failures:
- email service downtime
- network issues

can cause permanent notification loss.

---

## 5. Tight Coupling

Database operations, email sending, and push notifications are tightly connected.

This reduces flexibility and maintainability.

---

# Recommended Scalable Architecture

A queue-based asynchronous architecture is recommended.

## Architecture Flow

```text
Producer → Message Queue → Worker Services
```

---

# Components

## 1. Producer Service

The API server receives notification requests and publishes jobs to queue.

Example queues:
- RabbitMQ
- Kafka
- BullMQ

---

## 2. Message Queue

The queue stores notification jobs temporarily.

Benefits:
- Load balancing
- Retry support
- Reliable processing

---

## 3. Worker Services

Separate workers process notifications independently.

Workers can:
- save notifications to DB
- send emails
- send push notifications

---

# Improved Pseudocode

## Producer

```javascript
for (const student of students) {

    queue.publish({
        student,
        message
    });

}
```

---

## Worker

```javascript
consume(queue, async (job) => {

    await saveToDatabase(job);

    await sendEmail(job);

    await sendPushNotification(job);

});
```

---

# Advantages of Queue-Based Architecture

## 1. Scalability

Workers can scale horizontally.

More workers = faster processing.

---

## 2. Reliability

Failed jobs can retry automatically.

---

## 3. Better Performance

API responds quickly without waiting for all notifications.

---

## 4. Fault Isolation

Failure in email service does not stop database operations.

---

## 5. Asynchronous Processing

Heavy operations move to background workers.

---

# Additional Improvements

## Retry Mechanism

Failed jobs can retry automatically with exponential backoff.

---

## Dead Letter Queue (DLQ)

Failed notifications after multiple retries can move to DLQ for debugging.

---

## Monitoring

Tools:
- Prometheus
- Grafana

can monitor:
- queue size
- worker health
- processing speed

---

