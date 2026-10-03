// Horaires habituels, calculés dans le fuseau du restaurant, y compris après minuit.
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const frenchDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const minutes = time => {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
};
const displayTime = time => time.replace(/^0/, '').replace(':00', 'h').replace(':', 'h');

export function businessStatus(now, { timeZone, weeklyHours }) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const day = weekdays.indexOf(values.weekday);
  const minute = Number(values.hour) * 60 + Number(values.minute);

  // Le service commencé la veille peut encore être ouvert ce matin.
  for (const offset of [-1, 0]) {
    const schedule = weeklyHours[(day + offset + 7) % 7];
    for (const [opens, closes] of schedule) {
      const start = offset * 1440 + minutes(opens);
      const end = offset * 1440 + minutes(closes) + (minutes(closes) <= minutes(opens) ? 1440 : 0);
      if (minute >= start && minute < end) {
        return { open: true, text: `Ouvert · jusqu’à ${displayTime(closes === '24:00' ? '00:00' : closes)}` };
      }
    }
  }

  for (let offset = 0; offset < 8; offset += 1) {
    for (const [opens] of weeklyHours[(day + offset) % 7]) {
      if (offset === 0 && minutes(opens) <= minute) continue;
      const label = offset === 0 ? 'aujourd’hui' : offset === 1 ? 'demain' : frenchDays[(day + offset) % 7];
      return { open: false, text: `Fermé · ouvre ${label} à ${displayTime(opens)}` };
    }
  }
  return { open: false, text: 'Consultez nos horaires' };
}
