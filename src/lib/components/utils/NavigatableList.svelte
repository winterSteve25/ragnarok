<script lang="ts">
    let child: ChildNode | null;
    let focused: HTMLElement | undefined;
    
    function getChild(node: HTMLDivElement) {
        child = node.firstChild;
    }
</script>

<div use:getChild>
    <slot/>
</div>