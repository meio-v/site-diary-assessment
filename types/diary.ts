import { WeatherCondition } from "@/lib/weather"

export interface SiteDiary {
    id: number
    date: string
    description: string
    weather: WeatherCondition
    temperature: number | null
    created_at: string
    updated_at: string
  }
  
  export interface Resource {
    id: number
    name: string
    unit_of_measurement: string
    serial_number: string | null
    created_at: string
  }
  
  export interface ResourceUtilization {
    id: number
    site_diary_id: number
    resource_id: number
    value: number
    created_at: string 
  }
  
  export interface Visitor {
    id: number
    site_diary_id: number
    name: string
    company_name: string | null
    purpose_of_visit: string | null
    email: string | null
    contact_details: string | null
  }

  export interface Incident {
    id: number
    site_diary_id: number
    title: string
    description: string
    created_at: string
    updated_at: string
  }
  
  export function toDate(dateString: string): Date {
    return new Date(dateString)
  }
  
  export interface SiteDiaryWithRelations extends SiteDiary {
    resources?: ResourceUtilizationWithResource[]
    visitors?: Visitor[]
  }
  
  export interface ResourceUtilizationWithResource extends ResourceUtilization {
    resource: Resource
  }
  
  export interface SiteDiaryInput {
    date: string
    description: string
    weather: string
    resources?: {
      resource_id: number
      value: number
    }[]
    visitors?: {
      name: string
      company_name?: string | null
      purpose_of_visit?: string | null
      email?: string | null
      contact_details?: string | null
    }[]
  }