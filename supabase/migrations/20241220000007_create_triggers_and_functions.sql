-- Create function to handle car assignments
CREATE OR REPLACE FUNCTION handle_car_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update car's current driver when assignment is created
  IF TG_OP = 'INSERT' THEN
    UPDATE cars 
    SET driver_id = NEW.driver_id, 
        status = CASE WHEN NEW.driver_id IS NOT NULL THEN 'assigned' ELSE 'available' END
    WHERE id = NEW.car_id;
  END IF;
  
  -- Handle unassignment
  IF TG_OP = 'UPDATE' AND NEW.unassigned_at IS NOT NULL AND OLD.unassigned_at IS NULL THEN
    UPDATE cars 
    SET driver_id = NULL, 
        status = 'available'
    WHERE id = NEW.car_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for car assignments
CREATE TRIGGER handle_car_assignment_trigger 
  AFTER INSERT OR UPDATE ON car_assignments
  FOR EACH ROW EXECUTE FUNCTION handle_car_assignment();

-- Create function to update car mileage when weekly report is approved
CREATE OR REPLACE FUNCTION update_car_mileage_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Update car's current mileage when report is approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE cars 
    SET current_mileage = NEW.end_mileage
    WHERE id = NEW.car_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for weekly report approval
CREATE TRIGGER update_car_mileage_on_approval_trigger 
  AFTER UPDATE ON weekly_reports
  FOR EACH ROW EXECUTE FUNCTION update_car_mileage_on_approval();

-- Create function to automatically calculate total earnings from income sources
CREATE OR REPLACE FUNCTION calculate_total_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_earnings in weekly_reports when income_sources change
  UPDATE weekly_reports 
  SET total_earnings = (
    SELECT COALESCE(SUM(amount), 0)
    FROM income_sources 
    WHERE weekly_report_id = COALESCE(NEW.weekly_report_id, OLD.weekly_report_id)
  )
  WHERE id = COALESCE(NEW.weekly_report_id, OLD.weekly_report_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for income sources to update total earnings
CREATE TRIGGER calculate_total_earnings_insert_trigger 
  AFTER INSERT ON income_sources
  FOR EACH ROW EXECUTE FUNCTION calculate_total_earnings();

CREATE TRIGGER calculate_total_earnings_update_trigger 
  AFTER UPDATE ON income_sources
  FOR EACH ROW EXECUTE FUNCTION calculate_total_earnings();

CREATE TRIGGER calculate_total_earnings_delete_trigger 
  AFTER DELETE ON income_sources
  FOR EACH ROW EXECUTE FUNCTION calculate_total_earnings();
