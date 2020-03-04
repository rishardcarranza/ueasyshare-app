import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { MainService } from '../../services/main.service';
import { User } from 'src/app/interfaces/interfaces';
import { LocalService } from 'src/app/services/local.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { environment } from 'src/environments/environment';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { IOSFilePicker } from '@ionic-native/file-picker/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Platform, LoadingController, Events } from '@ionic/angular';
import { FileUploadResult } from '@ionic-native/file-transfer/ngx';
import { UserSocket } from '../../interfaces/interfaces';

declare var window: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
    title = 'Compartir';

    user: User;
    token = '';
    webSocket: WebsocketService;
    localIp = '';
    pathFile = '';
    loading: any;
    uploader: Promise<FileUploadResult>;
    users: UserSocket[];
    continue = false;
    userPlaying = '';
    isPlaying = false;
    LIBRARY = 1;
    FILE_SYSTEM = 2;
    CAMERA = 3;
    messagePercent = '';

    constructor(
        private camera: Camera,
        private mainService: MainService,
        private localService: LocalService,
        private notifications: NotificationsService,
        private fileChooser: FileChooser,
        private filePicker: IOSFilePicker,
        private filePath: FilePath,
        private loadingCtrl: LoadingController,
        private platform: Platform,
        private events: Events
    ) {

    }

    ionViewWillEnter() {
        this.localService.getStorage('SERVER_IP')
            .then(async ip => {
                // console.log('user will enter SERVER_IP', ip);
                this.localIp = ip;
                if (ip && this.localIp !== '') {
                    this.webSocket = await WebsocketService.getInstance(`http://${this.localIp}:${environment.socket_port}`);

                } else {
                    // Lanzar Toast
                    this.notifications.alertDisconnected();
                }
            })
            .catch((error) => {
                WebsocketService.SOCKET_STATUS = false;
            })
            .finally(() => {
                this.loadUserInfo();
            });
            // }
    }

    ngOnInit() {}

    loadUserInfo() {
        this.localService.getUserInfo()
            .then((response) => {
                console.log('Share', response);
                if (response.token && response.user) {
                    this.user = response.user;
                    this.token = response.token;

                    this.webSocket.emit('configurar-usuario', this.user, () => {});
                } else {
                    // this.user.username = environment.default_user;
                    console.log('user load info', this.user, this.token);

                    const data = {
                        id: 5,
                        username: '',
                        password: '',
                        first_name: 'Desconocido',
                        last_name: '',
                        email: '',
                        is_active: true,
                        date_joined: '',
                        last_login: ''
                    };

                    this.token = environment.token;
                    this.user = data;
                    this.webSocket.emit('configurar-usuario', data, () => {});
                }

            }).
            catch((error) => {
                // this.notifications.presentToast(`Error: ${error}`);
                console.log(`Error: ${error}`);
                this.user = null;
                this.token = '';
            });
    }

    async checkPlayingStatus(openWhat: number) {
        let msg = '';
        this.users = await this.webSocket.getUsuariosActivos();
        // console.log('Check Playing status', this.user);
        if (this.users) {
            for (const user of this.users) {
                if (user.playing) {
                    this.isPlaying = true;
                    this.userPlaying = user.username;
                    break;
                } else {
                    this.isPlaying = false;
                }
            }
        }

        console.log('Check playing status', this.isPlaying, this.userPlaying);

        if (this.isPlaying && this.userPlaying === this.user.username) {
            // Play
            this.openMediaType(openWhat);
        } else if (this.isPlaying && this.userPlaying !== this.user.username) {
            // Usuario desconocido o usuario logueado
            if (this.user.username === '') {
                msg = `Un usuario Desconocido no puede interrumpir el control.`;
                this.notifications.alertMessage(msg, 'Error al compartir');
            } else { // Usuario logueado esta solicitando
                if (this.userPlaying === '') {
                    this.openMediaType(openWhat);
                } else {
                    msg = `El usuario <strong>${this.userPlaying}</strong> posee el control. <br>¿Desea interrumpir?`;
                    this.notifications.alertInterrupt(msg, 'Error al compartir', () => {
                        this.openMediaType(openWhat);
                    });
                }
            }
        } else if (this.isPlaying === false) {
            // Play
            this.openMediaType(openWhat);
        }
    }

    openCamera() {
        const options: CameraOptions = {
            quality: 60,
            destinationType: this.camera.DestinationType.FILE_URI,
            // encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.ALLMEDIA,
            correctOrientation: true,
            sourceType: this.camera.PictureSourceType.CAMERA
        };

        this.camera.getPicture(options)
        .then((imageData) => {
            this.webSocket.emit('configurar-estado', this.user, () => {});
            // imageData is either a base64 encoded string or a file URI
            // If it's base64 (DATA_URL):
            // let base64Image = 'data:image/jpeg;base64,' + imageData;
            console.log(imageData);
            // Open loading to view the file transfer progress
            this.presentLoading(this.messagePercent);
            this.events.subscribe('progress:upload', (percentage) => {
                this.messagePercent = `Enviando archivo <br> ${percentage} %`;
                this.loading.message = this.messagePercent;
                // console.log('Progress file', percentage);
            });
            // const img = window.Ionic.WebWiew.convertFileSrc(imageData);
            this.mainService.uploadFile(this.token, imageData, this.user.id)
                .then(data => {
                    console.log('After upload', data);
                    this.loading.dismiss();
                })
                .catch(error => {
                    console.log(`Critical error: ${JSON.stringify(error)}`);
                    if (error.code === 1) {
                        this.notifications.alertMessage(`Extensión de archivo NO soportada`, 'Error de reprodución');
                    } else {
                        // tslint:disable-next-line: max-line-length
                        this.notifications.alertMessage(`Error desconocido ${error.code}, favor contacte al administrador`, 'Error critico');
                    }
                    this.loading.dismiss();
                });
            // console.log(img);
        }, (err) => {
            // Handle error
            console.log('Error ', JSON.stringify(err));
        });
    }

    openLibrary() {
        const options: CameraOptions = {
            quality: 60,
            destinationType: this.camera.DestinationType.FILE_URI,
            mediaType: this.camera.MediaType.ALLMEDIA,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
        };

        let filePath = '';

        this.camera.getPicture(options)
            .then((imageData) => {
                console.log('imageData', imageData);
                const splitPath = imageData.split(':');
                const contentType = splitPath[0];
                if (contentType === 'content') {
                    this.filePath.resolveNativePath(imageData)
                        .then(path => {
                            console.log('PATH', path);
                            filePath = path;

                            this.webSocket.emit('configurar-estado', this.user, () => {});
                            // Open loading to view the file transfer progress
                            this.presentLoading(this.messagePercent);
                            this.events.subscribe('progress:upload', (percentage) => {
                                this.messagePercent = `Enviando archivo <br> ${percentage} %`;
                                this.loading.message = this.messagePercent;
                                // console.log('Progress file', percentage);
                            });

                            this.mainService.uploadFile(this.token, filePath, this.user.id)
                                .then(data => {
                                    console.log('After upload', data);
                                    this.loading.dismiss();
                                })
                                .catch(error => {
                                    console.log(`Critical error: ${JSON.stringify(error)}`);
                                    if (error.code === 1) {
                                        this.notifications.alertMessage(`Extensión de archivo NO soportada`, 'Error de reprodución');
                                    } else {
                                        // tslint:disable-next-line: max-line-length
                                        this.notifications.alertMessage(`Error desconocido ${error.code}, favor contacte al administrador`, 'Error critico');
                                    }
                                    this.loading.dismiss();
                                });
                        });
                } else {
                    filePath = imageData;

                    this.webSocket.emit('configurar-estado', this.user, () => {});
                    // Open loading to view the file transfer progress
                    this.presentLoading(this.messagePercent);
                    this.events.subscribe('progress:upload', (percentage) => {
                        this.messagePercent = `Enviando archivo <br> ${percentage} %`;
                        this.loading.message = this.messagePercent;
                        // console.log('Progress file', percentage);
                    });

                    this.mainService.uploadFile(this.token, filePath, this.user.id)
                        .then(data => {
                            console.log('After upload', data);
                            this.loading.dismiss();
                        })
                        .catch(error => {
                            console.log(`Critical error: ${JSON.stringify(error)}`);
                            if (error.code === 1) {
                                this.notifications.alertMessage(`Extensión de archivo NO soportada`, 'Error de reprodución');
                            } else {
                                // tslint:disable-next-line: max-line-length
                                this.notifications.alertMessage(`Error desconocido ${error.code}, favor contacte al administrador`, 'Error critico');
                            }
                            this.loading.dismiss();
                        });
                }
                // console.log(img);
            }, (err) => {
                // Handle error
                console.log('Error ', err);
        });
    }

    openFileSystem() {
        this.platform.ready()
        .then(() => {
            if (this.platform.is('android')) {
                this.fileChooser.open()
                    .then(uri => {
                        console.log('URI', uri);
                        this.filePath.resolveNativePath(uri)
                            .then(path => {
                                this.webSocket.emit('configurar-estado', this.user, () => {});
                                console.log('PATH', path);
                                this.pathFile = path;

                                // Open loading to view the file transfer progress
                                this.presentLoading(this.messagePercent);
                                this.events.subscribe('progress:upload', (percentage) => {
                                    this.messagePercent = `Enviando archivo <br> ${percentage} %`;
                                    this.loading.message = this.messagePercent;
                                    // console.log('Progress file', percentage);
                                });

                                this.mainService.uploadFile(this.token, path, this.user.id)
                                    .then(data => {
                                        console.log('After upload', data);
                                        this.loading.dismiss();
                                    })
                                    .catch(error => {
                                        console.log(`Critical error: ${JSON.stringify(error)}`);
                                        if (error.code === 1) {
                                            this.notifications.alertMessage(`Extensión de archivo NO soportada`, 'Error de reprodución');
                                        } else {
                                            // tslint:disable-next-line: max-line-length
                                            this.notifications.alertMessage(`Error desconocido ${error.code}, favor contacte al administrador`, 'Error critico');
                                        }
                                        this.loading.dismiss();
                                    });
                            })
                            .catch(e => console.log(e));
                    })
                    .catch(e => console.log(e));
            } else if (this.platform.is('ios')) {
                this.filePicker.pickFile()
                    .then(uri => {
                        console.log('URI', uri);
                        this.filePath.resolveNativePath(uri)
                            .then(path => {
                                this.webSocket.emit('configurar-estado', this.user, () => {});
                                console.log('PATH', path);
                                // Open loading to view the file transfer progress
                                this.presentLoading(this.messagePercent);
                                this.events.subscribe('progress:upload', (percentage) => {
                                    this.messagePercent = `Enviando archivo <br> ${percentage} %`;
                                    this.loading.message = this.messagePercent;
                                    console.log('Progress file', percentage);
                                });

                                this.pathFile = path;
                                this.mainService.uploadFile(this.token, path, this.user.id)
                                    .then(data => {
                                        console.log('After upload', data);
                                        this.loading.dismiss();
                                    })
                                    .catch(error => {
                                        console.log(`Critical error: ${JSON.stringify(error)}`);
                                        // tslint:disable-next-line: max-line-length
                                        this.notifications.alertMessage(`Error desconocido ${error.code}, favor contacte al administrador`, 'Error critico');
                                        this.loading.dismiss();
                                    });
                            })
                            .catch(e => console.log(e));
                    })
                    .catch(e => console.log(e));
            }
        });
    }

    openMediaType(openWhat = this.LIBRARY) {
        switch (openWhat) {
            case this.LIBRARY:
                this.openLibrary();
                break;

            case this.FILE_SYSTEM:
                this.openFileSystem();
                break;

            case this.CAMERA:
                this.openCamera();
                break;
        }
    }

    // Loading
    async presentLoading(message: string) {
        this.loading  = await this.loadingCtrl.create({
            message
        });
        return this.loading.present();
    }

}
