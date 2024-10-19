import { defineComponent } from "vue";
export default defineComponent({
    setup() {
        return () => (
            <>
                <h1>Hello!</h1>
                <A></A>
            </>
        )
    }
})

const A = defineComponent({
    setup() {
        return () => <h2>hoho</h2>
    }
})
