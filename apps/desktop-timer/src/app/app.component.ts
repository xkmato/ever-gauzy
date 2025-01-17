import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { AppService } from './app.service';
import { AuthStrategy } from './auth/auth-strategy.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesEnum } from '@gauzy/contracts';
import { Store } from './auth/services/store.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import * as _ from 'underscore';
import {
	Router
} from '@angular/router';

@Component({
	selector: 'gauzy-root',
	template: '<router-outlet></router-outlet>',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	constructor(
		private electronService: ElectronService,
		private appService: AppService,
		private authStrategy: AuthStrategy,
		private router: Router,
		public readonly translate: TranslateService,
		private store: Store
	) {
		this.electronService.ipcRenderer.on('collect_data', (event, arg) => {
			this.appService
				.collectevents(arg.tpURL, arg.tp, arg.start, arg.end)
				.then((res) => {
					event.sender.send('data_push_activity', {
						timerId: arg.timerId,
						windowEvent: res,
						type: 'APP'
					});
				});
		});

		this.electronService.ipcRenderer.on('collect_afk', (event, arg) => {
			this.appService
				.collectAfk(arg.tpURL, arg.tp, arg.start, arg.end)
				.then((res) => {
					event.sender.send('data_push_afk', {
						timerId: arg.timerId,
						start: arg.start,
						afk: res
					});
				});
		});

		this.electronService.ipcRenderer.on(
			'collect_chrome_activities',
			(event, arg) => {
				this.appService
					.collectChromeActivityFromAW(arg.tpURL, arg.start, arg.end)
					.then((res) => {
						event.sender.send('data_push_activity', {
							timerId: arg.timerId,
							windowEvent: res,
							type: 'URL'
						});
					});
			}
		);

		this.electronService.ipcRenderer.on(
			'collect_firefox_activities',
			(event, arg) => {
				this.appService
					.collectFirefoxActivityFromAw(arg.tpURL, arg.start, arg.end)
					.then((res) => {
						event.sender.send('data_push_activity', {
							timerId: arg.timerId,
							windowEvent: res,
							type: 'URL'
						});
					});
			}
		);

		this.electronService.ipcRenderer.on('set_time_sheet', (event, arg) => {
			this.appService.pushToTimesheet(arg).then((res: any) => {
				arg.timesheetId = res.id;
				this.appService.setTimeLog(arg).then((result: any) => {
					event.sender.send('return_time_sheet', {
						timerId: arg.timerId,
						timeSheetId: res.id,
						timeLogId: result.id
					});
				});
			});
		});

		this.electronService.ipcRenderer.on(
			'update_time_sheet',
			(event, arg) => {
				this.appService.updateToTimeSheet(arg).then((res: any) => {
					this.appService.updateTimeLog(arg);
				});
			}
		);

		this.electronService.ipcRenderer.on(
			'set_auth_user',
			(event, arg) => {}
		);

		this.electronService.ipcRenderer.on('set_time_slot', (event, arg) => {
			this.appService
				.pushToTimeslot(arg)
				.then((res: any) => {
					if (res.id) {
						if (arg.idsAw) {
							event.sender.send('remove_aw_local_data', {
								idsAw: arg.idsAw
							});
						}
						if (arg.idsWakatime) {
							event.sender.send('remove_wakatime_local_data', {
								idsWakatime: arg.idsWakatime
							});
						}
						if (arg.idAfk) {
							event.sender.send('remove_afk_local_Data', {
								idAfk: arg.idAfk
							});
						}
						const timeLogs = res.timeLogs;
						event.sender.send('return_time_slot', {
							timerId: arg.timerId,
							timeSlotId: res.id,
							quitApp: arg.quitApp,
							timeLogs: timeLogs
						});
					}
				})
				.catch((e) => {
					event.sender.send('failed_save_time_slot', {
						params: e.error.params,
						message: e.message
					});
				});
		});

		this.electronService.ipcRenderer.on(
			'update_time_slot',
			(event, arg) => {
				this.appService.updateToTimeSlot(arg);
			}
		);

		this.electronService.ipcRenderer.on('set_activity', (event, arg) => {
			this.appService.pushToActivity(arg).then((res: any) => {
				event.sender.send('return_activity', {
					activityIds: arg.sourceIds
				});
			});
		});

		this.electronService.ipcRenderer.on(
			'update_to_activity',
			(event, arg) => {
				this.appService.updateToActivity(arg);
			}
		);

		this.electronService.ipcRenderer.on('set_time_log', (event, arg) => {
			this.appService.setTimeLog(arg).then((res: any) => {
				event.sender.send('return_time_log', {
					timerId: arg.timerId,
					timeLogId: res.id
				});
			});
		});

		this.electronService.ipcRenderer.on(
			'update_time_log_stop',
			(event, arg) => {
				console.log('Time Log Stopped');
				this.appService.updateTimeLog(arg);
			}
		);

		this.electronService.ipcRenderer.on('time_toggle', (event, arg) => {
			this.appService.toggleApi(arg).then((res) => {
				event.sender.send('return_toggle_api', {
					result: res,
					timerId: arg.timerId
				});
			});
		});

		this.electronService.ipcRenderer.on(
			'update_toggle_timer',
			(event, arg) => {
				this.appService.toggleApi(arg).then(() => {
					event.sender.send('timer_stopped');
				}).catch(() => {
					event.sender.send('timer_stopped');
				});
			}
		);

		this.electronService.ipcRenderer.on('server_ping', (event, arg) => {
			const pinghost = setInterval(() => {
				this.appService
					.pingServer(arg)
					.then((res) => {
						console.log('Server Found');
						event.sender.send('server_is_ready');
						clearInterval(pinghost);
					})
					.catch((e) => {
						console.log('ping status result', e.status);
						if (e.status === 404) {
							event.sender.send('server_is_ready');
							clearInterval(pinghost);
						}
					});
			}, 1000);
		});

		this.electronService.ipcRenderer.on(
			'upload_screen_shot',
			(event, arg) => {
				this.appService.uploadScreenCapture(arg).then((res) => {
					console.log('Screenshot Uploaded', res);
				});
			}
		);

		this.electronService.ipcRenderer.on(
			'server_ping_restart',
			(event, arg) => {
				const pinghost = setInterval(() => {
					this.appService
						.pingServer(arg)
						.then((res) => {
							console.log('server found');
							event.sender.send('server_already_start');
							clearInterval(pinghost);
						})
						.catch((e) => {
							console.log('ping status result', e.status);
							if (e.status === 404) {
								event.sender.send('server_already_start');
								clearInterval(pinghost);
							}
						});
				}, 3000);
			}
		);

		this.electronService.ipcRenderer.on('logout_timer', (event, arg) => {
			console.log(event, arg);
		});

		this.electronService.ipcRenderer.on('logout', () => {
			this.authStrategy.logout().toPromise().then(res => {				
				this.electronService.ipcRenderer.send('navigate_to_login');
			})
		});
	}

	ngOnInit(): void {
		console.log('On Init');
		this.electronService.ipcRenderer.send('app_is_init');
		this.store.systemLanguages$
			.pipe(untilDestroyed(this))
			.subscribe((languages) => {
				//Returns the language code name from the browser, e.g. "en", "bg", "he", "ru"
				const browserLang = this.translate.getBrowserLang();
				
				//Gets default enum laguages, e.g. "en", "bg", "he", "ru"
				const defaultLanguages = Object.values(LanguagesEnum);

				//Gets system laguages
				const systemLanguages: string[] = _.pluck(languages, 'code');
				systemLanguages.concat(defaultLanguages);

				//Sets the default language to use as a fallback, e.g. "en"
				this.translate.setDefaultLang(LanguagesEnum.ENGLISH);

				//Use browser language as a primary language, if not found then use system default language, e.g. "en"
				this.translate.use(
					systemLanguages.includes(browserLang) ? browserLang : LanguagesEnum.ENGLISH
				);
				
				// this.translate.onLangChange.subscribe(() => {
				// 	this.loading = false;
				// });
			});
	}
}
