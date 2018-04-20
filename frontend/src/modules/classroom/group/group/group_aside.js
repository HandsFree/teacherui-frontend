// @flow
import { aside, div, a, nav, i, span, h3, h1 } from '../../../../core/html';

import { Component } from '../../../../core/component';
import Status from '../../../status';

class GroupAside extends Component {
    editMode: boolean = false;
    updateHooks = {
        GroupNameUpdate: this.updateName,
        EditDoneClicked: this.toggleEditButton,
        GroupStudentsClicked: this.resetEditButton,
        AssignedGLPsClicked: this.resetEditButton,
        AnalyticsClicked: this.resetEditButton,
    };

    async updateName() {
        const group = await window.beaconingAPI.getGroup(this.props.id);

        if (group) {
            this.state.group = group;

            const groupNameEl = document.getElementById('group-aside-name');
            const groupCategoryEl = document.getElementById('group-aside-category');

            groupNameEl.textContent = group.name;
            groupCategoryEl.textContent = group.category;
        }
    }

    toggleEditButton() {
        const button = document.getElementById('group-edit-button');
        const icon = button.getElementsByTagName('i')[0];

        if (icon.classList.contains('icon-pencil')) {
            icon.classList.remove('icon-pencil');
            icon.classList.add('icon-trash-empty');
            this.editMode = true;

            return;
        }

        icon.classList.remove('icon-trash-empty');
        icon.classList.add('icon-pencil');
        this.editMode = false;
    }

    resetEditButton() {
        const button = document.getElementById('group-edit-button');
        const icon = button.getElementsByTagName('i')[0];

        if (icon.classList.contains('icon-trash-empty')) {
            icon.classList.remove('icon-trash-empty');
            icon.classList.add('icon-pencil');
            this.editMode = false;
        }
    }

    async handleEditClick() {
        if (this.editMode === false) {
            this.toggleEditButton();
            this.emit('GroupEditClicked');

            return;
        }

        const status = await window.beaconingAPI.deleteGroup(this.state.group.id);
        const statusMessage = new Status();

        console.log('[Delete Group] status:', status ? 'success!' : 'failed!');

        // const status = false;

        if (status) {
            this.emit('GroupDeleted');

            return;
        }

        const statusMessageEl = await statusMessage.attach({
            elementID: false,
            heading: 'Error',
            type: 'error',
            message: 'group not deleted!',
        });

        this.appendView(statusMessageEl);
    }

    async init() {
        const group = await window.beaconingAPI.getGroup(this.props.id);

        if (group) {
            this.state.group = group;
        }
    }

    async render() {
        const {
            name,
        } = this.state.group;

        return aside(
            '#group-aside',
            nav(
                '#group-options',
                a(
                    '#group-edit-button',
                    {
                        title: 'Edit',
                        onclick: () => {
                            this.handleEditClick();
                        },
                    },
                    i('.icon-pencil'),
                ),
            ),
            div(
                '#group-info',
                h1('#group-aside-name', name),
                h3('#group-aside-category', this.state.group.category),
            ),
            nav(
                '#group-nav',
                a(
                    '.item.active',
                    {
                        onclick: (event) => {
                            const { target } = event;

                            this.toggleActive(target);
                            this.emit('GroupStudentsClicked');
                        },
                    },
                    span('Students'),
                ),
                a(
                    '.item',
                    {
                        onclick: (event) => {
                            const { target } = event;

                            this.toggleActive(target);
                            this.emit('AssignedGLPsClicked');
                        },
                    },
                    span('Assigned GLPs'),
                ),
                // a(
                //     '.item',
                //     {
                //         onclick: (event) => {
                //             const { target } = event;

                //             this.toggleActive(target);
                //             this.emit('AnalyticsClicked');
                //         },
                //     },
                //     span('Analytics'),
                // ),
            ),
        );
    }

    toggleActive(el: EventTarget) {
        const nav = document.getElementById('group-nav');
        const active = nav.querySelector('.active');

        active.classList.remove('active');

        if (el.classList.contains('item')) {
            el.classList.add('active');
            return;
        }

        el.parentElement.classList.add('active');
    }
}

export default GroupAside;
