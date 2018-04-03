// @flow
import { div, p } from '../../../../core/html';

import { Component } from '../../../../core/component';
import AlternativesGraph from './alternatives_graph';
import ProgressGraph from './progress_graph';
import ScoresGraph from './scores_graph';
import CompletionGraph from './completion_graph';

class Charts extends Component {
    state = {
        analyticsData: {},
    };

    async init() {
        const { id } = this.props;

        const analyticsData = await window.beaconingAPI.getStudentAnalytics(id);

        this.state.analyticsData = analyticsData;

        window.Chart.defaults.global.defaultFontColor = 'white';
    }

    async render() {
        const alternativesGraph = new AlternativesGraph();
        const progressGraph = new ProgressGraph();
        const scoresGraph = new ScoresGraph();
        const completionGraph = new CompletionGraph();

        const graphWrapper = (title, el) => div(
            '.tile.spacing.flex-column.flex-3',
            div(
                '.title',
                p(title),
            ),
            div(
                '.content.graph',
                el,
            ),
        );

        return Promise.all([
            alternativesGraph.attach({
                graphData: this.state.analyticsData?.alternatives,
            }),
            progressGraph.attach({
                graphData: this.state.analyticsData?.progress,
            }),
            scoresGraph.attach({
                graphData: this.state.analyticsData?.scores,
            }),
            completionGraph.attach({
                graphData: this.state.analyticsData?.durations,
            }),
        ]).then((elements) => {
            const [
                alternativesGraphEl,
                progressGraphEl,
                scoresGraphEl,
                completionGraphEl,
            ] = elements;

            return div(
                '.flex-wrap',
                graphWrapper('Right and Wrong Answers', alternativesGraphEl),
                graphWrapper('Student Overall Progress', progressGraphEl),
                graphWrapper('Min, Average, Maximum Scores', scoresGraphEl),
                graphWrapper('Average Completion Time', completionGraphEl),
            );
        });
    }
}

export default Charts;
