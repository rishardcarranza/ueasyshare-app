import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

declare var window: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
    title = 'Compartir';

  constructor(
    private camera: Camera
  ) {

  }

  openCamera() {
    const options: CameraOptions = {
        quality: 60,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.ALLMEDIA,
        correctOrientation: true,
        sourceType: this.camera.PictureSourceType.CAMERA
    };

    this.camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64 (DATA_URL):
        // let base64Image = 'data:image/jpeg;base64,' + imageData;
        console.log(imageData);
        const img = window.Ionic.WebWiew.convertFileSrc(imageData);
        console.log(img);
    }, (err) => {
        // Handle error
        console.log('Error ', err);
    });
  }

  openLibrary() {
    const options: CameraOptions = {
        quality: 60,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.ALLMEDIA,
        correctOrientation: true,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    };

    this.camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64 (DATA_URL):
        // let base64Image = 'data:image/jpeg;base64,' + imageData;
        console.log(imageData);
        const img = window.Ionic.WebWiew.convertFileSrc(imageData);
        console.log(img);
    }, (err) => {
        // Handle error
        console.log('Error ', err);
    });
  }

}
