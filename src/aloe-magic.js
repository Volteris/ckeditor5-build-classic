import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import imageIcon from './aloe.svg';
// import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';
import axios from 'axios';
import params from './params';
import { v4 as uuidv4 } from 'uuid';
import { addToolbarToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

export default class AloeMagic extends Plugin {
	init() {
		// eslint-disable-next-line no-undef
		let filters = JSON.parse( localStorage.getItem( 'filters' ) );
		if ( !filters ) {
			filters = {
				card: {
					display: true,
					vowel: true,
					consonant: true
				},
				line: {
					display: true,
					vowel: true,
					consonant: true
				},
				text: {
					display: true,
					color: true,
					background: true
				}
			};
		}
		const editor = this.editor;

		editor.model.schema.register( 'aloe-magic', {
			// inheritAllFrom: '$text',
			allowWhere: '$block',
			allowContentOf: '$block',
			allowAttributes: [ 'class', 'data-json', 'contenteditable', 'id', 'data-filters' ],
			isBlock: true,
			isObject: true,
		} );

		editor.conversion.for( 'upcast' ).elementToElement( { model: 'aloe-magic', view: 'aloe-magic' } );
		editor.conversion.for( 'dataDowncast' ).elementToElement( { model: 'aloe-magic', view: 'aloe-magic' } );
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'aloe-magic',
			view: ( modelElement, viewWriter ) => {
				const section = viewWriter.createContainerElement( 'aloe-magic' );

				return toWidget( section, viewWriter );
			}
		} );
		editor.conversion.attributeToAttribute( { model: 'data-json', view: 'data-json' } );
		editor.conversion.attributeToAttribute( { model: 'contenteditable', view: 'contenteditable' } );
		editor.conversion.attributeToAttribute( { model: 'id', view: 'id' } );
		editor.conversion.attributeToAttribute( { model: 'data-filters', view: 'data-filters' } );

		editor.ui.componentFactory.add( 'aloeMagic', locale => {
			// The default dropdown.
			const dropdownView = createDropdown( locale, SplitButtonView );

			dropdownView.buttonView.set( {
				label: 'Aloé Magic',
				icon: imageIcon,
				tooltip: true
			} );

			const buttons = [];
			const source = [
				{ filter: 'card', action: 'display', name: 'CARTES' },
				{ filter: 'card', action: 'consonant', name: '| Consonnes' },
				{ filter: 'card', action: 'vowel', name: '| Voyelles' },
				{ filter: 'line', action: 'display', name: 'LIGNES' },
				{ filter: 'line', action: 'consonant', name: '| Consonnes' },
				{ filter: 'line', action: 'vowel', name: '| Voyelles' },
				{ filter: 'text', action: 'display', name: 'TEXTES' },
				{ filter: 'text', action: 'color', name: '| Couleurs' },
				{ filter: 'text', action: 'background', name: '| Formes' },
			];
			source.forEach( item => {
				const button = new SwitchButtonView();
				button.set( {
					label: item.name,
					tooltip: false,
					withText: true,
					isToggleable: true,
					isOn: filters[ item.filter ][ item.action ]
				} );
				button.on( 'execute', event => {
					const newValue = !filters[ item.filter ][ item.action ];
					filters[ item.filter ][ item.action ] = newValue;
					// eslint-disable-next-line no-undef
					localStorage.setItem( 'filters', JSON.stringify( filters ) );
					event.source.isOn = newValue;
				} );
				buttons.push( button );
			} );

			// Create a dropdown with a list inside the panel.
			addToolbarToDropdown( dropdownView, buttons );
			dropdownView.toolbarView.isVertical = true;

			// Callback executed once the image is clicked.
			dropdownView.buttonView.on( 'execute', () => {
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
						const dataFilters = JSON.stringify( filters );
						// eslint-disable-next-line no-undef,max-len
						const content = '<aloe-magic id="' + uuidv4() + '" contenteditable="false" data-json="' + window.btoa( unescape( encodeURIComponent( data ) ) ) + '" data-filters="' + window.btoa( unescape( encodeURIComponent( dataFilters ) ) ) + '">' + text + '</aloe-magic>';
						const viewFragment = editor.data.processor.toView( content );
						const modelFragment = editor.data.toModel( viewFragment );

						editor.model.insertContent( modelFragment );
					} );
				} ).catch( function( ) {
					// handle error
					// console.log( error );
				} );
			} );

			return dropdownView;
		} );
	}
}
