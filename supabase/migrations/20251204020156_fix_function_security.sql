/*
  # Fix Function Security Issues

  1. Security Fixes
    - Add secure search_path to revenue_to_number function to prevent search path injection attacks
    - This protects against malicious search_path manipulation

  2. Changes
    - Recreate revenue_to_number function with SET search_path = public, pg_temp
    - This ensures the function only uses the public schema and temporary tables
*/

-- Fix revenue_to_number function with secure search path
CREATE OR REPLACE FUNCTION public.revenue_to_number(revenue_str text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $function$
BEGIN
  CASE revenue_str
    WHEN '<$50k' THEN RETURN 50000;
    WHEN '$50k–$250k' THEN RETURN 250000;
    WHEN '$250k–$1M' THEN RETURN 1000000;
    WHEN '>$1M' THEN RETURN 2000000000;
    WHEN 'Not founded yet' THEN RETURN 0;
    ELSE RETURN 0;
  END CASE;
END;
$function$;