// src/models/State.ts
/*=============================
    MODEL LAYER: 
    Domain types for the US map quiz.  
===============================
    Contract for other layers; no rendering or persistence here.
      Enum: allowed progress states.
      Type: USPS code, full name, current status.
*/

// Exposed so controllers/views can import and use them.
export enum StateStatus {
  NotStarted = "NotStarted",   //needed define color in "View": render as white
  Partial    = "Partial",      
  Complete   = "Complete"      
}

// Domain object for a single US state.
// Controllers mutate `status`; Views read it to style the map.
export type USState = {
  code: string;       // Two-letter code, e.g., "CA"
  name: string;       // Full name, e.g., "California"
  status: StateStatus;// Current quiz progress state, function above.
};
