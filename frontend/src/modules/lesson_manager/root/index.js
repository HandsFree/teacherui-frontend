// @flow

import Router from '../../../core/router';
import Library from './library';
import ViewPlans from '../view_plan';
import ViewMission from '../view_mission';
import AssignPlan from '../assign_plan';

const router = new Router();

router.setRoutes([
    {
        path: '/',
        controller: new Library(),
    },
    {
        path: 'view',
        controller: new ViewPlans(),
    },
    {
        path: 'mission',
        controller: new ViewMission(),
    },
    {
        path: 'assign',
        controller: new AssignPlan(),
    },
]);

router.start();
