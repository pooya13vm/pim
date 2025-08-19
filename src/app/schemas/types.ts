export type FieldType = "text" | "number" | "select";
export type ShowIf = Record<string, string[]>;
export interface Step2Field {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  showIf?: ShowIf;
  requiredWhenVisible?: boolean;
  suffix?: string;
}
export interface Step2Schema {
  baseTitle: string;
  groups: Array<{ fields: Step2Field[] }>;
}
