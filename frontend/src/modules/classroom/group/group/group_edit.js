// @flow
import { section, div, form, p, input, label, span, select, option, small } from '../../../../core/html';

import { Component } from '../../../../core/component';
import Status from '../../../status';
import StudentsList from './students_list';

class StudentEdit extends Component {
    state = {
        group: {},
        groupName: '',
        groupCategory: '',
    };

    studentList: Array<Object> = [];

    updateHooks = {
        StudentSelected: this.updateStudentList,
    };

    async init() {
        if (!this.props.id) {
            throw new Error('[Group Edit] no group id provided');
        }

        const group = await window.beaconingAPI.getGroup(this.props.id);

        if (group) {
            this.state.group = group;

            return;
        }

        throw new Error('[Group Edit] group not found!');
    }

    updateStudentList() {
        const studentListEl = document.getElementById('student-list');
        const checkedEls = studentListEl.querySelectorAll('input[type="checkbox"]:checked');

        this.studentList = [];

        for (const el of checkedEls) {
            this.studentList.push({
                id: parseInt(el.value, 10),
            });
        }
    }

    async updateGroup(groupButton: EventTarget) {
        const { group } = this.state;

        // console.log(this.state.groupCategory);

        const obj = {
            id: group.id,
            name: this.state.groupName === '' ? group.name : this.state.groupName,
            category: this.state.groupCategory === '' ? group.category : this.state.groupCategory,
            students: this.studentList.length >= 1 ? this.studentList : group.students,
        };

        // console.log('Group Obj: ', obj);

        const status = await window.beaconingAPI.updateGroup(group.id, obj);
        const statusMessage = new Status();

        console.log('[Update Group] status:', status ? 'success!' : 'failed!');

        // const status = false;

        if (status) {
            const statusMessageEl = await statusMessage.attach({
                elementID: false,
                heading: 'Success',
                type: 'success',
                message: await window.bcnI18n.getPhrase('group_up'),
            });

            this.appendView(statusMessageEl);

            const doneButton = document.getElementById('edit-group-done');

            groupButton.textContent = await window.bcnI18n.getPhrase('cr_update_group');
            doneButton.textContent = await window.bcnI18n.getPhrase('done');

            this.emit('GroupNameUpdate');

            return;
        }

        const statusMessageEl = await statusMessage.attach({
            elementID: false,
            heading: 'Error',
            type: 'error',
            message: await window.bcnI18n.getPhrase('group_nu'),
        });

        groupButton.textContent = await window.bcnI18n.getPhrase('cr_update_group');

        this.appendView(statusMessageEl);
    }

    async render() {
        const { group } = this.state;

        const studentsArr = [];

        for (const obj of group.students) {
            studentsArr.push(obj.id);
        }

        const studentsList = new StudentsList();

        const studentsListEl = await studentsList.attach({
            groupStudents: studentsArr,
        });

        const updatingText = await window.bcnI18n.getPhrase('updating');

        return div(
            '.flex-column',
            section(
                '.flex-column',
                div(
                    '.margin-25.flex-column',
                    div(
                        '.general-info',
                        p(`${await window.bcnI18n.getPhrase('cr_group_edit_info')}:`),
                    ),
                    form(
                        '.create-group',
                        label(
                            span(await window.bcnI18n.getPhrase('cr_group_name')),
                            input(
                                '#group-name.text-field',
                                {
                                    type: 'text',
                                    value: group.name,
                                    oninput: (event) => {
                                        const { target } = event;

                                        this.state.groupName = target.value;
                                    },
                                },
                            ),
                        ),
                        label(
                            '.select',
                            span(await window.bcnI18n.getPhrase('cr_group_category')),
                            select(
                                '#group-category',
                                {
                                    onchange: (event) => {
                                        const { target } = event;

                                        this.state.groupCategory = target.value;
                                    },
                                },
                                option(
                                    {
                                        value: 'normal',
                                        selected: group.category === 'normal',
                                    },
                                    'Normal',
                                ),
                                option(
                                    {
                                        value: 'class',
                                        selected: group.category === 'class',
                                    },
                                    await window.bcnI18n.getPhrase('class'),
                                ),
                                option(
                                    {
                                        value: 'course',
                                        selected: group.category === 'course',
                                    },
                                    'Course',
                                ),
                            ),
                        ),
                        small(await window.bcnI18n.getPhrase('students')),
                        studentsListEl,
                        div(
                            '.flex-justify-end.margin-top-10',
                            div(
                                '#edit-group-done.button-passive',
                                {
                                    onclick: () => {
                                        this.emit('EditDoneClicked');
                                    },
                                },
                                await window.bcnI18n.getPhrase('cancel'),
                            ),
                            div(
                                '#create-group-button.button-action',
                                {
                                    onclick: (event) => {
                                        const { target } = event;
                                        this.updateGroup(target);

                                        target.textContent = `${updatingText}...`;
                                    },
                                },
                                await window.bcnI18n.getPhrase('cr_group_update'),
                            ),
                        ),
                    ),
                ),
            ),
        );
    }
}

export default StudentEdit;
