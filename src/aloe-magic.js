import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import imageIcon from './magic-solid.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class AloeMagic extends Plugin {
	init() {
		const editor = this.editor;

		editor.model.schema.register( 'aloe', {
			inheritAllFrom: '$block',
			allowAttributes: [ 'class', 'data-json' ],
			isBlock: true,
		} );

		editor.conversion.elementToElement( { model: 'aloe', view: 'aloe' } );
		editor.conversion.attributeToAttribute( { model: 'data-json', view: 'data-json' } );

		editor.ui.componentFactory.add( 'aloeMagic', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Aloé Magic',
				icon: imageIcon,
				tooltip: true
			} );

			// Callback executed once the image is clicked.
			view.on( 'execute', () => {
				editor.model.change( () => {
					const content = '<aloe data-json="{cool : cool, top : top}">YEAH</aloe>';
					const viewFragment = editor.data.processor.toView( content );
					const modelFragment = editor.data.toModel( viewFragment );

					editor.model.insertContent( modelFragment );
				} );
			} );

			return view;
		} );
	}
}
