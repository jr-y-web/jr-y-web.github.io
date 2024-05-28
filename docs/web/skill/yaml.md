# YAML：一种简洁直观的数据序列化语言

YAML（YAML Ain't Markup Language）是一种人类可读的数据序列化语言，广泛用于配置文件、数据交换和存储场景。它以数据为中心，强调清晰、简洁的语法，使得编写和阅读更为高效。

## `YAML` 简介

起源与发展： `YAML` 由 Clark Evans、Ingy döt Net 和 Oren Ben-Kiki 在 2001 年共同设计，旨在提供一种既适合机器解析又易于人类编写的通用数据格式。随着 DevOps、云计算和容器技术的发展，YAML 在各种工具和框架中（如 Ansible、Kubernetes、Docker 等）得到广泛应用。

设计理念： `YAML` 的设计原则包括易读性、简洁性和实用性。它的结构类似于 JSON 或 XML，但使用空格缩进替代了尖括号或者标签，使得内容层次分明，视觉效果更佳。

## `YAML` 语法特性

键值对： `YAML` 的基本单元是键值对，通过冒号分隔。例如：

```yml
name: John Doe
age: 30
```

数据结构： `YAML` 支持丰富的数据结构，包括标量（字符串、数字）、列表（数组）、字典（映射/哈希表）以及嵌套结构：

```yaml
users:
  - name: Alice
    age: 28
  - name: Bob
    age: 32
```

锚点与别名： `YAML` 允许使用&字符定义锚点，并使用\*进行引用，实现数据的重复利用：

```yaml
defaults: &DEFAULTS
language: English
location: USA
user1: *DEFAULTS
user2:
<<: *DEFAULTS
language: Chinese
```

流式样式： `YAML` 支持多文档流，一个 `YAML` 文件可以包含多个独立的文档，每个文档之间用三个连字符(---)进行分割。

## `YAML` 的应用场景

配置文件：许多现代应用程序（如 Rails、Jekyll、GitLab CI/CD 等）采用 `YAML` 作为配置文件格式。
IaC（Infrastructure as Code）：在 DevOps 领域，YAML 被用于描述基础设施配置，如 Kubernetes 的 manifests 和 Ansible 的 playbooks。
数据交换：由于其简洁和灵活的特性，YAML 常被用于不同系统间的数据交换。

## 注意事项

尽管 `YAML` 具有良好的可读性，但也存在一些潜在的陷阱，比如空格敏感性（用于表示层级关系），以及特殊字符处理规则。因此，在编写 `YAML` 时需注意以下几点：

- 确保正确的缩进，通常使用两个空格；
- 避免在字符串中误用特殊字符，如:、#等，必要时需使用引号包裹；
- 对于复杂的嵌套结构和引用，确保正确理解和应用相关语法。

最后，直接搓可以会有概率写错，这里有一个在线工具可以校验当前编写的 `YAML` 文件是否正确，可以作为参考：[`YAML` Checker](https://yamlchecker.com/)
