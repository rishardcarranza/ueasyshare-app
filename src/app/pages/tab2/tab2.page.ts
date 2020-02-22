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
import { Platform, LoadingController } from '@ionic/angular';

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

    constructor(
        private camera: Camera,
        private mainService: MainService,
        private localService: LocalService,
        private notifications: NotificationsService,
        private fileChooser: FileChooser,
        private filePicker: IOSFilePicker,
        private filePath: FilePath,
        private loadingCtrl: LoadingController,
        private platform: Platform
    ) {

    }

    ionViewWillEnter() {
        // this.presentLoading('75% Cargando...');

        // setTimeout(() => {
        //     this.loading.dismiss();
        // }, 1500);
        // console.log(this.platform.is('ios'));
        // Check the LOCAL IP
        this.localService.getStorage('SERVER_IP')
            .then(ip => {
                // console.log('user will enter SERVER_IP', ip);
                this.localIp = ip;
                if (ip && this.localIp !== '') {
                    // console.log('connected', (ip && this.localIp !== ''), ip, this.localIp);
                // this.connectToWS();
                    this.webSocket = WebsocketService.getInstance(`http://${this.localIp}:${environment.socket_port}`);

                    this.webSocket.socket.on('connect', () => {
                        WebsocketService.SOCKET_STATUS = true;
                    });
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
                console.log('Controls', response);
                if (response.token && response.user) {
                    this.user = response.user;
                    this.token = response.token;

                    this.webSocket.emit('configurar-usuario', this.user, () => {});
                } else {
                    // this.user.username = environment.default_user;
                    this.token = environment.token;
                    console.log('user load info', this.user, this.token);

                    const data = {
                        first_name: 'Desconocido',
                        last_name: '',
                        username: environment.default_user,
                        email: ''
                    };
                    this.webSocket.emit('configurar-usuario', data, () => {});
                }

            }).
            catch((error) => {
                // this.localService.presentToast(`Error: ${error}`);
                console.log(`Error: ${error}`);
                this.user = null;
                this.token = '';
            });
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
            // imageData is either a base64 encoded string or a file URI
            // If it's base64 (DATA_URL):
            // let base64Image = 'data:image/jpeg;base64,' + imageData;
            console.log(imageData);
            // const img = window.Ionic.WebWiew.convertFileSrc(imageData);

            this.mainService.uploadFile(this.token, imageData);
            // console.log(img);
        }, (err) => {
            // Handle error
            console.log('Error ', JSON.stringify(err));
        });
    }

    openLibrary() {
        this.platform.ready()
        .then(() => {
            const options: CameraOptions = {
                quality: 50,
                destinationType: this.camera.DestinationType.FILE_URI,
                mediaType: this.camera.MediaType.ALLMEDIA,
                sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
            };

            this.camera.getPicture(options)
                .then((imageData) => {
                    this.mainService.uploadFile(this.token, imageData);
                    // console.log(img);
                }, (err) => {
                    // Handle error
                    console.log('Error ', err);
            });
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
                                console.log('PATH', path);
                                this.pathFile = path;
                                this.mainService.uploadFile(this.token, path);
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
                                console.log('PATH', path);
                                this.pathFile = path;
                                this.mainService.uploadFile(this.token, path);
                            })
                            .catch(e => console.log(e));
                    })
                    .catch(e => console.log(e));
            }
        });
    }

    // Loading
    async presentLoading(message: string) {
        this.loading = await this.loadingCtrl.create({
            message
        //   duration: 2000
        });
        return this.loading.present();
    }

}
