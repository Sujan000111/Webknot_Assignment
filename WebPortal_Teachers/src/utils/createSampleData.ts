import { supabase } from '@/lib/supabase';

// Sample event types
const eventTypes = [
  { name: 'Hackathon', description: 'Coding competitions and challenges', color: '#3b82f6', icon: 'code' },
  { name: 'Workshop', description: 'Hands-on learning sessions', color: '#10b981', icon: 'wrench' },
  { name: 'Tech Talk', description: 'Expert presentations and discussions', color: '#f97316', icon: 'mic' },
  { name: 'Seminar', description: 'Educational presentations', color: '#8b5cf6', icon: 'book-open' },
  { name: 'Fest', description: 'Cultural and technical festivals', color: '#ec4899', icon: 'party-popper' },
  { name: 'Competition', description: 'Competitive events and contests', color: '#ef4444', icon: 'trophy' }
];

// Sample venues
const venues = [
  { name: 'Main Auditorium', capacity: 500, location: 'Building A, Ground Floor', facilities: ['Projector', 'AC', 'Sound System', 'Stage'] },
  { name: 'Computer Lab 1', capacity: 50, location: 'Building B, 2nd Floor', facilities: ['Computers', 'Projector', 'AC'] },
  { name: 'Seminar Hall', capacity: 100, location: 'Building C, 1st Floor', facilities: ['Projector', 'AC', 'Whiteboard'] },
  { name: 'Open Air Theater', capacity: 200, location: 'Central Campus', facilities: ['Stage', 'Sound System'] },
  { name: 'Library Conference Room', capacity: 30, location: 'Library, 3rd Floor', facilities: ['Projector', 'AC', 'Whiteboard'] }
];

// Sample events
const sampleEvents = [
  {
    title: 'Annual Tech Fest 2024',
    description: 'Join us for the biggest technology festival of the year featuring workshops, competitions, and tech talks by industry experts.',
    event_type_id: null, // Will be set after creating event types
    venue_id: null, // Will be set after creating venues
    start_date: '2024-03-15T09:00:00Z',
    end_date: '2024-03-17T18:00:00Z',
    max_capacity: 500,
    current_registrations: 0,
    registration_deadline: '2024-03-10T23:59:59Z',
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    requirements: ['Laptop', 'Student ID'],
    prerequisites: ['Basic programming knowledge'],
    what_included: ['Lunch', 'Certificates', 'Goodies'],
    price: 0
  },
  {
    title: 'React Native Workshop',
    description: 'Learn mobile app development with React Native. Build a complete mobile application from scratch.',
    event_type_id: null,
    venue_id: null,
    start_date: '2024-02-20T10:00:00Z',
    end_date: '2024-02-20T17:00:00Z',
    max_capacity: 50,
    current_registrations: 0,
    registration_deadline: '2024-02-18T23:59:59Z',
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    requirements: ['Laptop', 'Node.js installed'],
    prerequisites: ['Basic JavaScript knowledge'],
    what_included: ['Lunch', 'Certificate', 'Source code'],
    price: 500
  },
  {
    title: 'AI & Machine Learning Seminar',
    description: 'Explore the world of Artificial Intelligence and Machine Learning with industry experts.',
    event_type_id: null,
    venue_id: null,
    start_date: '2024-02-25T14:00:00Z',
    end_date: '2024-02-25T17:00:00Z',
    max_capacity: 100,
    current_registrations: 0,
    registration_deadline: '2024-02-23T23:59:59Z',
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    requirements: ['Notebook', 'Pen'],
    prerequisites: ['Basic programming knowledge'],
    what_included: ['Certificate', 'Refreshments'],
    price: 0
  },
  {
    title: 'Hackathon 2024',
    description: '48-hour coding competition. Build innovative solutions and win amazing prizes!',
    event_type_id: null,
    venue_id: null,
    start_date: '2024-03-01T09:00:00Z',
    end_date: '2024-03-03T18:00:00Z',
    max_capacity: 200,
    current_registrations: 0,
    registration_deadline: '2024-02-28T23:59:59Z',
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    requirements: ['Laptop', 'Team of 2-4 members'],
    prerequisites: ['Programming experience'],
    what_included: ['Food', 'Accommodation', 'Prizes', 'Certificates'],
    price: 0
  },
  {
    title: 'Web Development Bootcamp',
    description: 'Complete web development course covering HTML, CSS, JavaScript, and modern frameworks.',
    event_type_id: null,
    venue_id: null,
    start_date: '2024-02-15T09:00:00Z',
    end_date: '2024-02-16T17:00:00Z',
    max_capacity: 30,
    current_registrations: 0,
    registration_deadline: '2024-02-13T23:59:59Z',
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    requirements: ['Laptop', 'Code editor'],
    prerequisites: ['Basic computer knowledge'],
    what_included: ['Lunch', 'Certificate', 'Project files'],
    price: 300
  },
  {
    title: 'Data Science Workshop',
    description: 'Learn data analysis, visualization, and machine learning with Python.',
    event_type_id: null,
    venue_id: null,
    start_date: '2024-03-05T10:00:00Z',
    end_date: '2024-03-05T16:00:00Z',
    max_capacity: 50,
    current_registrations: 0,
    registration_deadline: '2024-03-03T23:59:59Z',
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    requirements: ['Laptop', 'Python installed'],
    prerequisites: ['Basic Python knowledge'],
    what_included: ['Lunch', 'Certificate', 'Datasets'],
    price: 400
  }
];

export const createEventTypes = async () => {
  try {
    console.log('Creating event types...');
    
    const { data, error } = await supabase?.from('event_types').insert(eventTypes).select();
    
    if (error) {
      console.error('Error creating event types:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Event types created successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to create event types:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const createVenues = async () => {
  try {
    console.log('Creating venues...');
    
    // Get the first college ID
    const { data: colleges } = await supabase?.from('colleges').select('id').limit(1);
    const collegeId = colleges?.[0]?.id;
    
    if (!collegeId) {
      return { success: false, error: 'No college found. Please create a college first.' };
    }
    
    const venuesWithCollege = venues.map(venue => ({
      ...venue,
      college_id: collegeId
    }));
    
    const { data, error } = await supabase?.from('venues').insert(venuesWithCollege).select();
    
    if (error) {
      console.error('Error creating venues:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Venues created successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to create venues:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const createSampleEvents = async () => {
  try {
    console.log('Creating sample events...');
    
    // Get event types
    const { data: eventTypesData } = await supabase?.from('event_types').select('id, name');
    if (!eventTypesData || eventTypesData.length === 0) {
      return { success: false, error: 'No event types found. Please create event types first.' };
    }
    
    // Get venues
    const { data: venuesData } = await supabase?.from('venues').select('id, name');
    if (!venuesData || venuesData.length === 0) {
      return { success: false, error: 'No venues found. Please create venues first.' };
    }
    
    // Get colleges
    const { data: collegesData } = await supabase?.from('colleges').select('id');
    const collegeId = collegesData?.[0]?.id;
    if (!collegeId) {
      return { success: false, error: 'No college found. Please create a college first.' };
    }
    
    // Get admin profile
    const { data: adminData } = await supabase?.from('admin_profiles').select('id').limit(1);
    const adminId = adminData?.[0]?.id;
    
    // Map event types and venues
    const eventTypeMap = new Map(eventTypesData.map(et => [et.name.toLowerCase().replace(/\s+/g, ''), et.id]));
    const venueMap = new Map(venuesData.map(v => [v.name, v.id]));
    
    // Create events with proper IDs
    const eventsToCreate = sampleEvents.map(event => {
      let eventTypeId = null;
      let venueId = null;
      
      // Map event type
      if (event.title.toLowerCase().includes('hackathon')) {
        eventTypeId = eventTypeMap.get('hackathon');
      } else if (event.title.toLowerCase().includes('workshop')) {
        eventTypeId = eventTypeMap.get('workshop');
      } else if (event.title.toLowerCase().includes('seminar')) {
        eventTypeId = eventTypeMap.get('seminar');
      } else if (event.title.toLowerCase().includes('bootcamp')) {
        eventTypeId = eventTypeMap.get('workshop');
      } else if (event.title.toLowerCase().includes('tech')) {
        eventTypeId = eventTypeMap.get('techtalk');
      } else {
        eventTypeId = eventTypeMap.get('workshop');
      }
      
      // Map venue based on capacity
      if (event.max_capacity <= 30) {
        venueId = venueMap.get('Library Conference Room');
      } else if (event.max_capacity <= 50) {
        venueId = venueMap.get('Computer Lab 1');
      } else if (event.max_capacity <= 100) {
        venueId = venueMap.get('Seminar Hall');
      } else if (event.max_capacity <= 200) {
        venueId = venueMap.get('Open Air Theater');
      } else {
        venueId = venueMap.get('Main Auditorium');
      }
      
      return {
        ...event,
        college_id: collegeId,
        event_type_id: eventTypeId,
        venue_id: venueId,
        created_by: adminId
      };
    });
    
    const { data, error } = await supabase?.from('events').insert(eventsToCreate).select();
    
    if (error) {
      console.error('Error creating events:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Events created successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to create events:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const createSampleRegistrations = async () => {
  try {
    console.log('Creating sample registrations...');
    
    // Get events
    const { data: events } = await supabase?.from('events').select('id, max_capacity, current_registrations');
    if (!events || events.length === 0) {
      return { success: false, error: 'No events found. Please create events first.' };
    }
    
    // Get students
    const { data: students } = await supabase?.from('students').select('id').limit(100);
    if (!students || students.length === 0) {
      return { success: false, error: 'No students found. Please create students first.' };
    }
    
    const registrations = [];
    const statuses = ['confirmed', 'waitlisted', 'cancelled'];
    
    // Create registrations for each event
    for (const event of events) {
      const maxRegistrations = Math.min(event.max_capacity, 50); // Limit to 50 registrations per event
      const numRegistrations = Math.floor(Math.random() * maxRegistrations) + 10; // 10-50 registrations
      
      // Shuffle students and take a random sample
      const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
      const selectedStudents = shuffledStudents.slice(0, numRegistrations);
      
      for (let i = 0; i < selectedStudents.length; i++) {
        const student = selectedStudents[i];
        const registrationDate = new Date();
        registrationDate.setDate(registrationDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
        
        // Determine status based on position
        let status = 'confirmed';
        if (i >= event.max_capacity * 0.8) {
          status = 'waitlisted';
        } else if (Math.random() < 0.05) { // 5% chance of cancelled
          status = 'cancelled';
        }
        
        registrations.push({
          event_id: event.id,
          student_id: student.id,
          registration_date: registrationDate.toISOString(),
          status: status
        });
      }
    }
    
    // Insert registrations in batches
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < registrations.length; i += batchSize) {
      batches.push(registrations.slice(i, i + batchSize));
    }
    
    let totalInserted = 0;
    for (const batch of batches) {
      const { error } = await supabase?.from('registrations').insert(batch);
      if (error) {
        console.error('Error inserting registration batch:', error);
        continue;
      }
      totalInserted += batch.length;
    }
    
    // Update event registration counts
    for (const event of events) {
      const { count } = await supabase?.from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'confirmed');
      
      await supabase?.from('events')
        .update({ current_registrations: count || 0 })
        .eq('id', event.id);
    }
    
    console.log(`Registrations created successfully: ${totalInserted} total`);
    return { success: true, data: { totalInserted } };
  } catch (err) {
    console.error('Failed to create registrations:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const createAllSampleData = async () => {
  try {
    console.log('Creating all sample data...');
    
    const results = {
      eventTypes: null,
      venues: null,
      events: null,
      registrations: null
    };
    
    // Create event types
    console.log('Step 1: Creating event types...');
    results.eventTypes = await createEventTypes();
    if (!results.eventTypes.success) {
      return { success: false, error: `Failed to create event types: ${results.eventTypes.error}` };
    }
    
    // Create venues
    console.log('Step 2: Creating venues...');
    results.venues = await createVenues();
    if (!results.venues.success) {
      return { success: false, error: `Failed to create venues: ${results.venues.error}` };
    }
    
    // Create events
    console.log('Step 3: Creating events...');
    results.events = await createSampleEvents();
    if (!results.events.success) {
      return { success: false, error: `Failed to create events: ${results.events.error}` };
    }
    
    // Create registrations
    console.log('Step 4: Creating registrations...');
    results.registrations = await createSampleRegistrations();
    if (!results.registrations.success) {
      return { success: false, error: `Failed to create registrations: ${results.registrations.error}` };
    }
    
    console.log('All sample data created successfully!');
    return { success: true, data: results };
  } catch (err) {
    console.error('Failed to create sample data:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
