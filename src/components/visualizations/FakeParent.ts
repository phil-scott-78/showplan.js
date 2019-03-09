import * as ShowPlan from '@/parser/showplan';

export class ParentRelOpAction extends ShowPlan.RelOpAction {
}

export class ParentRelOp extends ShowPlan.RelOp {
    public constructor() {
        super(new ParentRelOpAction(), 0, 0, 0, 0, 0, 0, 0, 'Root', 0, false, 'Root', []);
        this.NodeId = -1;
    }
}
