// @flow
import { p, div } from '../../../../core/html';

import { Component } from '../../../../core/component';
import StudentBox from './student_box';

class StudentsList extends Component {
    async init() {
        if (window.sessionStorage) {
            let studentsSession = window.sessionStorage.getItem('students');

            if (studentsSession) {
                studentsSession = JSON.parse(studentsSession);

                if ((Date.now() / 60000) - (studentsSession.time / 60000) < 1) {
                    this.state.students = studentsSession.students;
                    return;
                }
            }
        }

        if (!this.state.students) {
            const students = await window.beaconingAPI.getStudents();
            if (!students) {
                console.log('Failed to load students!');

                this.state.students = [];
                return;
            }

            this.state.students = students;

            window.sessionStorage.setItem('students', JSON.stringify({
                students: this.state.students,
                time: Date.now(),
            }));
        }
    }

    async render() {
        const students = Object.values(this.state.students);
        const promArr = [];

        for (const student of students) {
            const {
                id,
                profile,
            } = student;

            const studentBox = new StudentBox();

            const studentBoxProm = studentBox.attach({
                id,
                profile,
            });

            promArr.push(studentBoxProm);
        }

        return Promise.all(promArr)
            .then(elements => div('#student-list.flex-wrap.margin-10', elements));
    }
}

export default StudentsList;