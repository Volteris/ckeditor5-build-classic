import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import imageIcon from './magic-solid.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import axios from 'axios';
import params from './params';
import { v4 as uuidv4 } from 'uuid';

export default class AloeMagic extends Plugin {
	init() {
		const editor = this.editor;

		editor.model.schema.register( 'aloe-magic', {
			// inheritAllFrom: '$text',
			allowWhere: '$block',
			allowContentOf: '$block',
			allowAttributes: [ 'class', 'data-json', 'contenteditable', 'id', 'data-filters' ],
			isBlock: true,
			isObject: true,
		} );

		editor.conversion.elementToElement( { model: 'aloe-magic', view: 'aloe-magic' } );
		editor.conversion.attributeToAttribute( { model: 'data-json', view: 'data-json' } );
		editor.conversion.attributeToAttribute( { model: 'contenteditable', view: 'contenteditable' } );
		editor.conversion.attributeToAttribute( { model: 'id', view: 'id' } );
		editor.conversion.attributeToAttribute( { model: 'data-filters', view: 'data-filters' } );

		editor.ui.componentFactory.add( 'aloeMagic', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Aloé Magic',
				icon: imageIcon,
				tooltip: true
			} );

			// Callback executed once the image is clicked.
			view.on( 'execute', () => {
				// Get Selected Text
				const selection = editor.model.document.selection;
				const range = selection.getFirstRange();
				let text = '';
				for ( const item of range.getItems() ) {
					if ( item.is( 'textProxy' ) ) {
						text += item.data;
					}
				}

				// Http Call
				axios.post( params.endpoint, text, { headers: { 'Content-Type': 'application/json' } } ).then( function( response ) {
					// handle success
					// console.log( response );

					editor.model.change( () => {
						const data = JSON.stringify( response.data );
						// eslint-disable-next-line no-undef,max-len
						const content = '<aloe-magic id="' + uuidv4() + '" contenteditable="false" data-json="' + window.btoa( data ) + '">' + text + '</aloe-magic>';
						const viewFragment = editor.data.processor.toView( content );
						const modelFragment = editor.data.toModel( viewFragment );

						editor.model.insertContent( modelFragment );
					} );
				} ).catch( function( ) {
					// handle error
					// console.log( error );
				} );
			} );

			return view;
		} );
	}
}
