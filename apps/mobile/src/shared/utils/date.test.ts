import { getDurationParts } from './date';

describe('getDurationParts', () => {
  it('returns a whole number of days with no remainder hours', () => {
    // arrange
    const startIso = '2026-07-01T00:00:00.000Z';
    const endIso = '2026-07-03T00:00:00.000Z';

    // act
    const result = getDurationParts(startIso, endIso);

    // assert
    expect(result).toEqual({ days: 2, hours: 0 });
  });

  it('returns both days and hours when the span has a remainder', () => {
    // arrange
    const startIso = '2026-07-01T00:00:00.000Z';
    const endIso = '2026-07-03T01:00:00.000Z';

    // act
    const result = getDurationParts(startIso, endIso);

    // assert
    expect(result).toEqual({ days: 2, hours: 1 });
  });

  it('returns 0 days when the span is under 24 hours', () => {
    // arrange
    const startIso = '2026-07-01T08:00:00.000Z';
    const endIso = '2026-07-01T14:00:00.000Z';

    // act
    const result = getDurationParts(startIso, endIso);

    // assert
    expect(result).toEqual({ days: 0, hours: 6 });
  });

  it('returns null when start and end are equal', () => {
    // arrange
    const startIso = '2026-07-01T00:00:00.000Z';
    const endIso = '2026-07-01T00:00:00.000Z';

    // act
    const result = getDurationParts(startIso, endIso);

    // assert
    expect(result).toBeNull();
  });

  it('returns null when end is before start', () => {
    // arrange
    const startIso = '2026-07-05T00:00:00.000Z';
    const endIso = '2026-07-01T00:00:00.000Z';

    // act
    const result = getDurationParts(startIso, endIso);

    // assert
    expect(result).toBeNull();
  });
});
