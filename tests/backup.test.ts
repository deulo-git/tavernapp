import { describe, expect, it } from 'vitest';
import { BACKUP_FORMAT, restoreOps, validateBackup, type BackupFile } from '../src/data/backup';
import type { Category, Dish } from '../src/domain/types';

const category = (id: string): Category => ({ id, name: id, order: 0, createdAt: 0, updatedAt: 0 });
const dish = (id: string, withImage = false): Dish => ({
  id,
  kind: 'dish',
  name: id,
  categoryId: 'c1',
  price: null,
  tags: [],
  ingredients: [],
  allergens: [],
  traces: [],
  preparation: '',
  explanation: '',
  pairings: [],
  order: 0,
  available: true,
  image: withImage ? { v: 1, thumb: 'data:image/jpeg;base64,x' } : null,
  createdAt: 0,
  updatedAt: 0,
});

function backup(overrides: Partial<BackupFile> = {}): BackupFile {
  return {
    format: BACKUP_FORMAT,
    version: 1,
    exportedAt: 0,
    categories: [category('c1')],
    dishes: [dish('keep', true)],
    drinks: [],
    guides: [],
    info: null,
    images: [{ id: 'keep', v: 1, data: 'data:image/jpeg;base64,abc' }],
    ...overrides,
  };
}

describe('validateBackup', () => {
  it('accepts a well-formed backup', () => {
    expect(validateBackup(JSON.parse(JSON.stringify(backup()))).ok).toBe(true);
  });
  it('rejects other files', () => {
    expect(validateBackup({ hello: 'world' }).ok).toBe(false);
    expect(validateBackup(null).ok).toBe(false);
    expect(validateBackup(backup({ version: 2 as 1 })).ok).toBe(false);
  });
  it('rejects mixed-up item kinds and broken images', () => {
    expect(validateBackup(backup({ drinks: [dish('x') as never] })).ok).toBe(false);
    expect(validateBackup(backup({ images: [{ id: 'x', v: 1, data: 'javascript:alert(1)' }] })).ok).toBe(false);
  });
});

describe('restoreOps', () => {
  it('writes the backup and deletes whatever is not in it, images included', () => {
    const ops = restoreOps(backup(), {
      categories: [category('c1'), category('old')],
      dishes: [dish('keep', true), dish('gone', true)],
      drinks: [],
      guides: [],
      info: null,
    });
    const deletes = ops.filter((o) => o.type === 'delete').map((o) => o.path);
    const sets = ops.filter((o) => o.type === 'set').map((o) => o.path);
    expect(deletes.sort()).toEqual(['categories/old', 'dishes/gone', 'images/gone']);
    expect(sets).toEqual(expect.arrayContaining(['categories/c1', 'dishes/keep', 'images/keep']));
  });
});
