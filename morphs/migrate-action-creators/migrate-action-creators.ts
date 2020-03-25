import { Project } from 'ts-morph';

import { ActionCreatorsActionsMorpher } from './migrate-action-creators.actions';
import { ActionCreatorsEffectMorpher } from './migrate-action-creators.effects';
import { ActionCreatorsReducerMorpher } from './migrate-action-creators.reducers';

const config = {
  control: {
    actions: true,
    reducer: true,
    effects: true,
  },
  save: true,
  saveIndividual: false,
  explicitPath: true,
};

const storeName = 'viewconf';
const storePath = 'D:/Projects/pwa-github/src/app/core/store/checkout/viewconf'; // no closing slash
const project = new Project({
  tsConfigFilePath: 'D:/Projects/pwa-github/tsconfig.json',
});

/*
  Please make sure there are no star imports used in your store!
*/
export class ActionCreatorsMorpher {
  actionsMorph: ActionCreatorsActionsMorpher;
  reducerMorph: ActionCreatorsReducerMorpher;
  effectsMorph: ActionCreatorsEffectMorpher;

  constructor(public storeName: string, public project: Project, public config) {
    const fileAccess = config.explicitPath ? `${storePath}/${storeName}` : storeName;
    this.actionsMorph = new ActionCreatorsActionsMorpher(project.getSourceFile(`${fileAccess}.actions.ts`), this);
    this.reducerMorph = new ActionCreatorsReducerMorpher(project.getSourceFile(`${fileAccess}.reducer.ts`), this);
    this.effectsMorph = new ActionCreatorsEffectMorpher(project.getSourceFile(`${fileAccess}.effects.ts`), this);
  }

  migrate() {
    console.log(`migrating '${storeName}' store`);

    // migrate actions
    this.config.control.actions ? this.actionsMorph.migrateActions() : null;
    this.config.saveIndividual ? this.project.save() : null;

    // migrate reducer
    this.config.control.reducer ? this.reducerMorph.migrateReducer() : null;
    this.config.saveIndividual ? this.project.save() : null;

    // migrate effects
    this.config.control.effects ? this.effectsMorph.migrateEffects() : null;
    this.config.saveIndividual ? this.project.save() : null;

    this.config.save ? project.save() : null;
  }
}

const morpher = new ActionCreatorsMorpher(storeName, project, config);
morpher.migrate();
