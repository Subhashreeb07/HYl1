-- Fix foreign key constraint to allow cascade delete on facility_fields
-- This allows deleting fields even if booking responses reference them

ALTER TABLE booking_responses 
DROP CONSTRAINT fk_booking_responses_field;

ALTER TABLE booking_responses
ADD CONSTRAINT fk_booking_responses_field FOREIGN KEY (field_id)
    REFERENCES facility_fields (field_id) ON DELETE CASCADE;
