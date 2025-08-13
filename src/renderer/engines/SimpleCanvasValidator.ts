export class SimpleCanvasValidator {
  static async validateBasicRequirements(): Promise<{ isValid: boolean; issues: string[] }>{
    const issues: string[] = [];
    if (typeof window === 'undefined') issues.push('window missing');
    if (typeof document === 'undefined') issues.push('document missing');
    return { isValid: issues.length === 0, issues };
  }

  static async generateSimpleReport(): Promise<string> {
    return 'SimpleCanvasValidator Report: OK';
  }
}


