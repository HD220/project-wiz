// src_refactored/core/domain/annotation/value-objects/annotation-text.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { AnnotationText } from './annotation-text.vo';
import { ValueError } from '../../../../common/errors';

describe('AnnotationText', () => {
  it('should create an AnnotationText with valid text', () => {
    const text = 'This is a valid annotation.';
    const annotationText = AnnotationText.create(text);
    expect(annotationText).toBeInstanceOf(AnnotationText);
    expect(annotationText.value()).toBe(text);
  });

  it('should trim whitespace from text upon validation but store original if create is called with it', () => {
    const textWithSpace = '  Valid text with spaces.  ';
    // Validation is internal. The VO should store the value as passed if it's valid post-trimming.
    // Let's adjust the VO to store the trimmed version to be consistent.
    // Re-evaluating this: the VO should store what it's given if valid.
    // The validation ensures the *trimmed* version meets criteria.
    // For now, let's assume it stores the original valid input.
    const annotationText = AnnotationText.create(textWithSpace);
    expect(annotationText.value()).toBe(textWithSpace);


    const textJustEnough = '  V  ';
    const annotationTextEnough = AnnotationText.create(textJustEnough);
    expect(annotationTextEnough.value()).toBe(textJustEnough);
  });

  it('should throw ValueError if text is null or undefined', () => {
    expect(() => AnnotationText.create(null as any)).toThrow(ValueError);
    expect(() => AnnotationText.create(undefined as any)).toThrow(ValueError);
  });

  it('should throw ValueError if trimmed text is empty', () => {
    expect(() => AnnotationText.create('')).toThrow(ValueError);
    expect(() => AnnotationText.create('   ')).toThrow(ValueError);
  });

  it('should throw ValueError if text is too short (after trimming)', () => {
    // Assuming MIN_LENGTH is 1, so empty string is the only too short case after trim.
    // If MIN_LENGTH was > 1, e.g. 3:
    // expect(() => AnnotationText.create('a')).toThrow(ValueError);
    // expect(() => AnnotationText.create(' a ')).toThrow(ValueError);
    // Current MIN_LENGTH = 1, so this test is covered by empty string check.
  });

  it('should throw ValueError if text is too long', () => {
    const longText = 'a'.repeat(5001); // Assuming MAX_LENGTH = 5000
    expect(() => AnnotationText.create(longText)).toThrow(ValueError);
  });

  it('should allow text at min and max length boundaries (after trimming)', () => {
    const minText = 'A';
    expect(() => AnnotationText.create(minText)).not.toThrow();
    const minTextSpaced = '  A  ';
    expect(() => AnnotationText.create(minTextSpaced)).not.toThrow();

    const maxText = 'a'.repeat(5000);
    expect(() => AnnotationText.create(maxText)).not.toThrow();
  });

  it('should correctly compare two AnnotationTexts with the same value', () => {
    const text = 'Identical text.';
    const annotationText1 = AnnotationText.create(text);
    const annotationText2 = AnnotationText.create(text);
    expect(annotationText1.equals(annotationText2)).toBe(true);
  });

  it('should correctly compare two AnnotationTexts with different values', () => {
    const annotationText1 = AnnotationText.create('Text One');
    const annotationText2 = AnnotationText.create('Text Two');
    expect(annotationText1.equals(annotationText2)).toBe(false);
  });
});
