-- ================================================================
-- MIGRATION 026: Advanced Scheduling Updates
-- Purpose: Support for Meeting Links, Color Coding, and Conflict Detection
-- Created: 2025-12-10
-- ================================================================

-- 1. Add Columns to Classes
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_platform TEXT DEFAULT 'zoom' CHECK (meeting_platform IN ('zoom', 'google_meet', 'teams', 'other')),
ADD COLUMN IF NOT EXISTS color_code TEXT DEFAULT '#3b82f6'; -- Default blue

-- 2. Conflict Detection Function
-- This function checks if a trainer OR room is already booked in the given time range.
-- Returns the nature of the conflict ('trainer' or 'room') and the title of the conflicting class.
CREATE OR REPLACE FUNCTION check_conflict(
    p_trainer_id UUID, 
    p_room_id UUID, 
    p_start_time TIMESTAMPTZ, 
    p_end_time TIMESTAMPTZ,
    p_exclude_class_id UUID DEFAULT NULL
) RETURNS TABLE(conflict_type TEXT, conflict_details TEXT) AS $$
BEGIN
    -- Check Trainer Conflict
    RETURN QUERY
    SELECT 'trainer'::TEXT, c.title
    FROM classes c
    WHERE c.trainer_id = p_trainer_id
    AND (p_exclude_class_id IS NULL OR c.id != p_exclude_class_id)
    AND c.status != 'cancelled'
    AND tstzrange(c.start_time, c.end_time) && tstzrange(p_start_time, p_end_time);

    -- Check Room Conflict
    RETURN QUERY
    SELECT 'room'::TEXT, c.title
    FROM classes c
    WHERE c.room_id = p_room_id
    AND (p_exclude_class_id IS NULL OR c.id != p_exclude_class_id)
    AND c.status != 'cancelled'
    AND tstzrange(c.start_time, c.end_time) && tstzrange(p_start_time, p_end_time);
END;
$$ LANGUAGE plpgsql;
