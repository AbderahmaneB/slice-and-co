import test from 'node:test';
import assert from 'node:assert/strict';
import { businessStatus } from '../public/assets/business-hours.js';
import { site } from '../site.config.mjs';
const status = timestamp => businessStatus(new Date(timestamp), site);

test('ouverture et fermeture du déjeuner, aux limites exactes', () => {
  assert.equal(status('2026-10-05T09:29:59Z').open, false); // 11h29 à Paris
  assert.equal(status('2026-10-05T09:30:00Z').open, true);
  assert.equal(status('2026-10-05T12:29:59Z').open, true);
  assert.equal(status('2026-10-05T12:30:00Z').open, false);
  assert.match(status('2026-10-05T12:30:00Z').text, /aujourd’hui à 18h/);
});
test('le vendredi soir reste ouvert le samedi jusqu’à 2h', () => {
  assert.equal(status('2026-10-02T23:59:00Z').open, true); // Samedi 1h59
  assert.match(status('2026-10-02T23:59:00Z').text, /jusqu’à 2h/);
  assert.equal(status('2026-10-03T00:00:00Z').open, false);
});
test('le service du dimanche se prolonge le lundi matin', () => {
  assert.equal(status('2026-10-04T23:30:00Z').open, true); // Lundi 1h30
  assert.equal(status('2026-10-05T00:00:00Z').open, false); // Lundi 2h
  assert.match(status('2026-10-05T00:00:00Z').text, /aujourd’hui à 11h30/);
});
test('fin de service à minuit en semaine et dimanche sans déjeuner', () => {
  assert.equal(status('2026-10-05T21:59:00Z').open, true);
  assert.match(status('2026-10-05T21:59:00Z').text, /jusqu’à 0h/);
  assert.equal(status('2026-10-05T22:00:00Z').open, false);
  assert.match(status('2026-10-04T10:00:00Z').text, /aujourd’hui à 18h/);
  assert.match(status('2026-10-03T00:00:00Z').text, /aujourd’hui à 11h30/);
});
test('horaires de Paris après le changement d’heure, indépendants du navigateur', () => {
  assert.equal(status('2026-11-02T10:29:00Z').open, false);
  assert.equal(status('2026-11-02T10:30:00Z').open, true);
  assert.equal(status('2026-10-24T23:59:00Z').open, true); // 1h59 été
  assert.equal(status('2026-10-25T00:59:00Z').open, false); // 2h59 été
  assert.equal(status('2026-10-25T01:30:00Z').open, false); // 2h30 hiver, heure répétée
});
test('jour suivant et planning exceptionnel sans service', () => {
  assert.match(status('2026-10-05T21:00:00Z').text, /jusqu’à 0h/);
  assert.match(status('2026-10-05T22:30:00Z').text, /aujourd’hui à 11h30/);
  const empty = { timeZone: 'Europe/Paris', weeklyHours: [[], [], [], [], [], [], []] };
  assert.equal(businessStatus(new Date('2026-10-05T10:00:00Z'), empty).open, false);
});
