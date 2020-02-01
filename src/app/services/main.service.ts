import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalService } from './local.service';
import { environment } from 'src/environments/environment';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';


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
    private fileTransfer: FileTransfer
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
    console.log('Upload', nameFile);
    // const fileName = filePath.split('/');
    const options: FileUploadOptions = {
        fileKey: 'file',
        fileName: nameFile,
        headers: {
            Authorization: `Token ${token}`
        },
        params: {
            server: 1,
            user: 1
        }
    };

    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    console.log('Upload url', `${this.serverURL}/api/v1/media-files/`, filePath);
    fileTransfer.upload(filePath, `${this.serverURL}/api/v1/media-files/`, options)
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.log(`Critical error: ${JSON.stringify(error)}`);
        });
  }

}
