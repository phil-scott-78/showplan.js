import { mount } from '@vue/test-utils';
import App from '@/App.vue';


describe('we can mount app.vue', () => {
    test('actually works', () => {
        const wrapper = mount(App,
            {
                stubs: {
                    'font-awesome-icon': true,
                    'file-upload-drop': true,
                },
            });

        expect(wrapper.isVueInstance).toBeTruthy();
    });
});
