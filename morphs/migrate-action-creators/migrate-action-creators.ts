import { Project } from 'ts-morph';

import { ActionCreatorsActionsMorpher } from './migrate-action-creators.actions';
import { ActionCreatorsEffectMorpher } from './migrate-action-creators.effects';
import { ActionCreatorsReducerMorpher } from './migrate-action-creators.reducers';

const control = {
  actions: true,
  reducer: false,
  effects: false,
};
const save = true;

const storeName = 'contact';
const project = new Project({
  tsConfigFilePath: 'D:/Projects/pwa-github/tsconfig.json',
});

console.log(`migrating '${storeName}' store`);
// migrate actions
const actionMorph = new ActionCreatorsActionsMorpher(project.getSourceFile(`${storeName}.actions.ts`), storeName);
control.actions ? actionMorph.migrateActions() : null;

// migrate reducer
const reducerMorph = new ActionCreatorsReducerMorpher(storeName, project.getSourceFile(`${storeName}.reducer.ts`));
control.reducer ? reducerMorph.migrateReducer() : null;

// migrate effects
const effectsMorph = new ActionCreatorsEffectMorpher(storeName, project.getSourceFile(`${storeName}.effects.ts`));
control.effects ? effectsMorph.migrateEffects() : null;

save ? project.save() : null;
