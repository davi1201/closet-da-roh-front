// Em @/domains/survey/types/survey-types.ts

export interface SurveyFormValues {
  frequency: string | null;
  style_preference: string | null;
  priority_in_purchase: string | null;
  preferred_sales_model: string | null;
  exclusive_service_attraction: string | null;
  personalized_service_drawback: string | null;
  age_range: string | null;
  occupation: string;
}

export interface SurveyResponse extends SurveyFormValues {
  _id: string;
  createdAt: string;
  updatedAt: string;
  collected_by?: { _id: string; name: string };
}
