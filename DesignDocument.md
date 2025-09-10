

# Event Management System – My Design Idea

**Author:** Sujan J (1MJ21IS106)
**Date:** 10 Sept 2025

Hey team,

This is my rough design for that event system for college. 

## My Goals 
- I want staff to be able to create events.
- I want students to register for those events.
- We need to take attendence on the event day, maybe for morning/afternoon sessions if it's a long event.
- I think we should collect some simple feedback after.
- And finally, I want to show reports to staff (like who came, who didn't, avg feedback).


## Data I think we need to track
- **Events:** needs a title, descripion, date/time, where its happening (venue), how many people can come (capacity), and a status like is it published or still a draft. also who made it.
- **Students:** I'll just need their usn, name, email, branch and sem. And an active/inactive status.
- **Registration:** This table just links a student to an event. I'll also store when they registered and if they are `registered` or on the `waitlist`.
- **Attendance:** This links a student to an event too, but just to say if they were `present` or `absent`. I added a `session` field here which can be null.
- **Feedback:** Again, links student and event. I'm thinking a rating from 1 to 5 and an optional comment box.
- **Audit:** I was thinking its good to know who created or edited an event, so I'll probably just add `created_by` columns.

My main idea here is to not duplicate student data in every table. I'll just store their ID to link them.

---

## My Database Schema Idea

I will be using supabase-postgres sql 

```sql
students
  - id (uuid) PK
  - usn (text) UNIQUE NOT NULL          -- our USN format, e.g., 1MJ21IS106
  - name (text) NOT NULL
  - email (text) UNIQUE
  - branch (text)
  - semester (int)
  - status (text) DEFAULT 'active'
  - created_at (timestamptz) DEFAULT now()

events
  - id (uuid) PK
  - title (text) NOT NULL
  - description (text)
  - starts_at (timestamptz) NOT NULL
  - ends_at (timestamptz) NOT NULL
  - venue (text)
  - capacity (int)                      -- unlimited if we leave it blank
  - status (text) DEFAULT 'published'   -- can be draft/published/cancelled
  - created_by (uuid)                   -- this will be a staff user id
  - created_at (timestamptz) DEFAULT now()

registrations
  - id (uuid) PK
  - event_id (uuid) FK -> events.id ON DELETE CASCADE
  - student_id (uuid) FK -> students.id ON DELETE CASCADE
  - status (text) DEFAULT 'registered'  -- registered/waitlisted/cancelled
  - source (text)                       -- maybe 'web' or 'app'
  - registered_at (timestamptz) DEFAULT now()
  - UNIQUE (event_id, student_id)

attendance
  - id (uuid) PK
  - event_id (uuid) FK -> events.id ON DELETE CASCADE
  - student_id (uuid) FK -> students.id ON DELETE CASCADE
  - session (text)                      -- like 'morning' or 'afternoon', can be null
  - present (bool) NOT NULL
  - marked_by (uuid)                    -- staff user id
  - marked_at (timestamptz) DEFAULT now()
  - UNIQUE (event_id, student_id, session) -- not sure if this is the right way for nulls

feedback
  - id (uuid) PK
  - event_id (uuid) FK -> events.id ON DELETE CASCADE
  - student_id (uuid) FK -> students.id ON DELETE CASCADE
  - rating (smallint) CHECK (rating BETWEEN 1 AND 5)
  - comments (text)
  - submitted_at (timestamptz) DEFAULT now()
  - UNIQUE (event_id, student_id)

-- indexes
--  - registartions: idx_reg_event, idx_reg_student
--  - attendance: idx_att_event, idx_att_student
--  - feedback: idx_fb_event
````

My best attempt at a diagram lol:

```text
students (1) ----------------┐
                             │
                             │        ┌─────────┐
                             ├──< registrations >─┤
                             │        └─────────┘
                             │              ^
                             │              │
                             │        ┌─────────┐
                             ├──< attendance >───┤
                             │        └─────────┘
                             │              ^
                             │              │
                             │        ┌─────────┐
                             └──< feedback >─────┤
                                      └─────────┘

events (1) --------------------------------------┘
```

I didn't make a `staff` or `users` table yet. The `created_by` and `marked_by` fields will point to that table when I create it.

-----

## My idea for the APIs (REST?)

I'll put everything under `/api/v1`. It'll all be JSON. I think for auth we can just use a bearer token to know if it's a student or staff. For errors, I'll just return a simple JSON like `{ "error": "something went wrong" }`.

### Events

  - `GET /events?status=published` - I want to be able to list events, maybe filter by date too.
  - `GET /events/:id` - Get one event.
  - `POST /events` (only for staff) - I'll send the body like `{ "title": "...", "startsAt": "..." }`
  - `PUT /events/:id` (staff)
  - `DELETE /events/:id` (staff)

### Students

  - `POST /students` – I think we'll need a way for admins to add students. Body `{ "usn": "...", "name": "..." }`

### Registrations

  - `POST /events/:id/register` (for students) - The server can probably figure out the studentId from my auth token. I think it should give a 409 error if I'm already registered.
  - `GET /events/:id/registrations` (for staff) - Just to see who signed up.
  - `DELETE /registrations/:registrationId` (for student or staff) - I think this is better, to cancel a specific registration.

### Attendance

  - `POST /events/:id/attendance/bulk` (for staff) - not sure if this is the best way but I think sending all marks at once is better. body: `{ "session": "morning", "marks": [{ "studentId": "...", "present": true }] }`
  - `PATCH /events/:id/attendance/:studentId` (staff)
  - `GET /events/:id/attendance` (staff)

### Feedback

  - `POST /events/:id/feedback` (student) - body: `{ "rating": 5, "comments": "was great!" }`. I'll only allow this if the student actually registered for the event.
  - `GET /events/:id/feedback` (staff) – list all feedback.

### Reports

  - `GET /reports/events/:id/attendance-summary`
  - `GET /reports/events/:id/feedback-summary`
  - `GET /reports/students/:studentId/history` - to see a student's past events.



-----

## How I think it will work (Workflows)

**Registration (from student app):**

1.  First I'll call `GET /events` to see the list.
2.  Then I'll `POST /events/:id/register` to sign up.
3.  The API will try to put me in the `registrations` table in the DB.
4.  If it's full or I'm already in, the DB will complain and the API will tell me.
5.  Otherwise, it will tell me I'm registered, or maybe waitlisted.

**Attendance (staff on event day):**

1.  I guess the staff member will first `GET /events/:id/registrations` to get the list of students.
2.  They'll just tap checkboxes in the app to mark who is here.
3.  Then the app will call my `POST /events/:id/attendance/bulk` API with everyone's status. This bulk thing should be faster than one by one, i hope.
4.  API saves it all to the DB.
5.  API tells the app it's all saved.

-----

## Assumptions & Problems I thought of

  - I'm assuming registration just closes when we hit the `capacity`. If capacity is not set, then anyone can join.
  - What if I try to register twice? The API should just reject it with a 409 error. But if I cancelled before, I should be allowed to re-register.
  - The waitlist part is a bit tricky, for now I'm just thinking we have a `waitlisted` status, but how they get promoted... maybe a script or something? I haven't figured that bit out.
  - Can someone get their attendece marked if they didn't register? I think we should say no, to keep the data clean. But maybe a staff needs to override it sometimes?
  - I'll only allow feedback if a student is in the registration list. I won't check if they were actually present, because what if they left early but still want to give feedback.
  - If an event is cancelled, nobody new can register.
  - I'm not checking if a student registers for two events at the same time. For now, that's their problem to manage haha.

-----

## Some other random stuff I thought of (Non-functional)

  - **Security:** For security I'm just thinking of the bearer token we used before. We can check if the token belongs to a 'student' or 'staff'. If we use Supabase we can use its Row Level Security.
  - **Performance:** I put indexes on the foreign keys, so it should be fast enough. The bulk attendance API should also help.
  - **Data quality:** I used UNIQUE constraints so we don't get duplicate data.

-----

## This is the design ,i will be following for the complete flow
Sujan J
{1MJ21IS106}
-----

