// src/models/ConfigurationModel.ts

/**
 * ConfigurationModel
 * - Holds global, user-configurable options such as:
 *   - maxErrors: how many mistakes are allowed before game over
 *   - difficulty level: here we simply equate it with maxErrors
 */

import { OPTION_MAX_ERRORS, OPTION_MIN_ERRORS } from "../utils/constants";

export class ConfigurationModel {
  private maxErrors: number = 3;

  public getMaxErrors() {
    return this.maxErrors;
  }

  public setMaxErrors(value: number) {
    // clamp 1, 10
    const v = Math.min(OPTION_MAX_ERRORS, Math.max(OPTION_MIN_ERRORS, value));
    this.maxErrors = v;
  }

  public getDifficultyLevel() {
    return this.maxErrors;
  }
}
