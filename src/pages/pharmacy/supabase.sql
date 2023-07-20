-- //! Need to create a RLS policy to fetch only organisation drugs!

CREATE OR REPLACE FUNCTION calculate_running_total()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
    NEW.running_total = (
        SELECT COALESCE(SUM(CASE WHEN receiving THEN quantity ELSE -quantity END), 0)
        FROM cdr_entries 
        WHERE drug_id = NEW.drug_id globestan
          AND (date < NEW.date OR (date = NEW.date AND id < NEW.id))
    );

    -- Include the current row in the running total
    IF NEW.receiving THEN
        NEW.running_total := NEW.running_total + NEW.quantity;
    ELSE
        NEW.running_total := NEW.running_total - NEW.quantity;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_running_total ON cdr_entries;

CREATE TRIGGER update_running_total BEFORE INSERT OR UPDATE ON cdr_entries 
FOR EACH ROW EXECUTE PROCEDURE calculate_running_total();


-- //! add a locked_by field to the cdr_entries table