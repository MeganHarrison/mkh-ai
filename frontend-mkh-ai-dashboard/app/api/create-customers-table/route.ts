import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Mark the route as dynamic
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    // SQL to create the customers table
    const sql = `
      CREATE TABLE IF NOT EXISTS customers (
        id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        gender VARCHAR(50),
        birthday VARCHAR(100),
        country VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );
      
      -- Create a function to automatically update the updated_at timestamp if it doesn't exist
      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = TIMEZONE('utc', NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Create a trigger to call the function before update if it doesn't exist
      DROP TRIGGER IF EXISTS update_customers_modtime ON customers;
      CREATE TRIGGER update_customers_modtime
      BEFORE UPDATE ON customers
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `

    // Execute the SQL
    const { error } = await supabase.rpc("pgql", { query: sql })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: "Customers table created successfully" })
  } catch (error) {
    console.error("Error creating customers table:", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message || "An error occurred" },
      { status: 500 },
    )
  }
}
