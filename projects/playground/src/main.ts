import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { enableDiagramProdMode } from '../../ngx-diagrams/src/lib/utils/tool-kit.util';

if (environment.production) {
	enableDiagramProdMode();
	enableProdMode();
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch(err => console.error(err));
