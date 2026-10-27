  // BUGFIX CE7: direct characteristic editing.
  const CHARACTERISTIC_EDITING_ENABLED = true;
  const CE7Logic = {
    integer(value) {
      const text = String(value ?? '').trim();
      if(!/^\d+$/.test(text)) return null;
      const number = Number(text);
      return Number.isSafeInteger(number) ? number : null;
    },
    valid(name, field, value) {
      const number = this.integer(value);
      return number !== null && (field !== 'rank' || name === 'taint' || number <= 10);
    },
    undoMilliseconds: 20000
  };
