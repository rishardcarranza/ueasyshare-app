import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalService } from './local.service';
import { environment } from 'src/environments/environment';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MainService {

    localIp = '';
    serverURL = '';

  constructor(
    private http: HttpClient,
    private localService: LocalService,
    // tslint:disable-next-line: deprecation
    private fileTransfer: FileTransfer,
    private platfom: Platform
    ) {
        this.localService.getStorage('SERVER_IP')
        .then(ip => {
            this.localIp = ip;
            this.serverURL = `http://${this.localIp}:${environment.api_port}`;
        });
    }

  loginUser(user: string, pass: string) {
    const params = {
        username: user,
        password: pass
    };

    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json'
        })
    };

    return this.http.post(`${this.serverURL}/api/v1/rest-auth/login/`, params, httpOptions).toPromise();
  }

  logoutUser(token: string) {

    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json',
            Authorization: `Token ${token}`
        })
    };

    return this.http.post(`${this.serverURL}/api/v1/rest-auth/logout/`, {}, httpOptions).toPromise();
  }

  sendCommand(token: string, action: string, value: string) {
    console.log('Token: ', token);
    const params = {
        action,
        value
    };

    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json',
            Authorization: `Token ${token}`
        })
    };

    return this.http.post(`${this.serverURL}/api/v1/command/`, params, httpOptions).toPromise();
  }

  uploadFile(token: string, filePath: string) {
    const splitPath = filePath.split('/');
    const nameFile = splitPath[splitPath.length - 1];
    let loaded = 0;
    let total = 0;

    console.log('Upload', nameFile);
    // const fileName = filePath.split('/');
    const options: FileUploadOptions = {
        fileKey: 'file',
        fileName: nameFile,
        headers: {
            Authorization: `Token ${token}`
            // Connection: 'close'
        },
        params: {
            user: 1,
            server: 1
        },
        chunkedMode: false // OJO !!! Para que funcione el envio de parametros en ANDROID
    };

    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    console.log('Upload url', `${this.serverURL}/api/v1/media-files/`, filePath, options);
    fileTransfer.upload(filePath, `${this.serverURL}/api/v1/media-files/`, options)
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.log(`Critical error: ${JSON.stringify(error)}`);
        });

    fileTransfer.onProgress(listener => {
        loaded = listener.loaded;
        total = listener.total;
        console.log(listener);
    });
  }

}
