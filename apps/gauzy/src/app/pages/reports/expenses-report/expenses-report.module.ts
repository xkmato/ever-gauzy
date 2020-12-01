import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpensesReportRoutingModule } from './expenses-report-routing.module';
import { ExpensesReportComponent } from './expenses-report/expenses-report.component';
import { FormsModule } from '@angular/forms';
import {
	NbIconModule,
	NbSpinnerModule,
	NbCardModule,
	NbSelectModule
} from '@nebular/theme';
import { TranslateModule } from '@ngx-translate/core';
import { FiltersModule } from '../../../@shared/timesheet/filters/filters.module';
import { ExpensesReportGridModule } from '../../../@shared/report/expenses-report-grid/expenses-report-grid.module';
import { ExpansesReportHorizontalChartModule } from '../charts/expanses-report-horizontal-chart/expanses-report-horizontal-chart.module';

@NgModule({
	declarations: [ExpensesReportComponent],
	imports: [
		CommonModule,
		ExpensesReportRoutingModule,

		TranslateModule,
		NbIconModule,
		NbSpinnerModule,
		NbCardModule,
		FiltersModule,
		NbSelectModule,
		FormsModule,
		ExpensesReportGridModule,
		ExpansesReportHorizontalChartModule
	]
})
export class ExpensesReportModule {}